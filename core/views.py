from django.shortcuts import render, get_object_or_404
from django.http import HttpResponse, JsonResponse
from django.views.decorators.http import require_POST
from .models import (
    Equipment, ValidationCategory, ValidationChecklistItem, ValidationResult, 
    EquipmentDevice, DocumentationCategory, DocumentationChecklistItem, DocumentationResult,
    Variant, BomItem, BomItemVariant, DocHistoryItem
)


def dashboard(request):
    """Main dashboard view."""
    context = {
        'active_view': 'dashboard',
        'page_title': 'Dashboard',
    }
    return render(request, 'dashboard.html', context)


def validation(request):
    """Validation Protocol main view with equipment sidebar."""
    equipment_list = Equipment.objects.all()
    categories = ValidationCategory.objects.prefetch_related('items').all()
    
    # Get selected equipment (default to first)
    selected_id = request.GET.get('equipment_id')
    if selected_id:
        selected_equipment = get_object_or_404(Equipment, pk=selected_id)
    else:
        selected_equipment = equipment_list.first()
    
    # Get existing results for selected equipment
    results = {}
    ok_count = 0
    if selected_equipment:
        for result in selected_equipment.validation_results.all():
            results[result.checklist_item_id] = result.status
            if result.status == 'OK':
                ok_count += 1
    
    # Total checklist items
    total_items = ValidationChecklistItem.objects.count()
    
    context = {
        'active_view': 'validation',
        'page_title': 'Validation Protocol',
        'equipment_list': equipment_list,
        'selected_equipment': selected_equipment,
        'categories': categories,
        'results': results,
        'ok_count': ok_count,
        'total_items': total_items,
    }
    return render(request, 'validation_protocol.html', context)


def validation_checklist_partial(request, equipment_id):
    """HTMX partial: Returns checklist table for a specific equipment."""
    equipment = get_object_or_404(Equipment, pk=equipment_id)
    categories = ValidationCategory.objects.prefetch_related('items').all()
    
    # Get existing results for this equipment
    results = {}
    for result in equipment.validation_results.all():
        results[result.checklist_item_id] = result.status
    
    context = {
        'selected_equipment': equipment,
        'categories': categories,
        'results': results,
    }
    return render(request, 'partials/validation_checklist.html', context)


@require_POST
def submit_validation(request, equipment_id, item_id):
    """HTMX endpoint: Save OK/NOK result for a checklist item."""
    equipment = get_object_or_404(Equipment, pk=equipment_id)
    checklist_item = get_object_or_404(ValidationChecklistItem, pk=item_id)
    status = request.POST.get('status')
    
    if status not in ['OK', 'NOK']:
        return HttpResponse("Invalid status", status=400)
    
    # Create or update the result
    result, created = ValidationResult.objects.update_or_create(
        equipment=equipment,
        checklist_item=checklist_item,
        defaults={'status': status}
    )
    
    # Calculate updated progress
    total_items = ValidationChecklistItem.objects.count()
    ok_count = equipment.validation_results.filter(status='OK').count()
    progress = round((ok_count / total_items) * 100) if total_items > 0 else 0
    
    # Determine color class
    if progress == 100:
        color_class = 'text-green-500'
        bar_class = 'bg-green-500'
    elif progress >= 50:
        color_class = 'text-yellow-500'
        bar_class = 'bg-yellow-500'
    else:
        color_class = 'text-red-500'
        bar_class = 'bg-red-500'
    
    # Return buttons + OOB swap for status card
    buttons_html = render(request, 'partials/validation_buttons.html', {
        'item': checklist_item,
        'equipment': equipment,
        'status': status,
    }).content.decode('utf-8')
    
    # OOB swap for status card
    status_oob = f'''
    <div id="status-card" hx-swap-oob="true" class="bg-gradient-to-r from-gray-800 to-gray-700 p-6 rounded-lg border border-gray-600 flex justify-between items-center shadow-sm">
        <div>
            <h3 class="text-lg font-bold text-white mb-1">Status Validare</h3>
            <p class="text-sm text-gray-400">{ok_count} / {total_items} Puncte Validate (OK)</p>
        </div>
        <div class="flex items-center gap-4">
            <div class="text-right">
                <span class="text-2xl font-bold {color_class}">{progress}%</span>
                <span class="text-xs text-gray-500 block">Progres</span>
            </div>
            <div class="w-24 h-2 bg-gray-600 rounded-full overflow-hidden">
                <div class="h-full transition-all duration-500 {bar_class}" style="width: {progress}%;"></div>
            </div>
        </div>
    </div>
    '''
    
    # OOB swap for sidebar progress
    if progress == 100:
        badge_class = 'bg-green-900/30 text-green-400 border-green-800'
    elif progress >= 50:
        badge_class = 'bg-yellow-900/30 text-yellow-400 border-yellow-800'
    else:
        badge_class = 'bg-red-900/30 text-red-400 border-red-800'
    
    sidebar_oob = f'''
    <span id="sidebar-progress-{equipment.id}" hx-swap-oob="true" class="text-[10px] px-1.5 py-0.5 rounded-full border font-bold min-w-[36px] text-center {badge_class}">{progress}%</span>
    '''
    
    return HttpResponse(buttons_html + status_oob + sidebar_oob)


def equipment_progress_partial(request, equipment_id):
    """HTMX partial: Returns progress badge for equipment sidebar."""
    equipment = get_object_or_404(Equipment, pk=equipment_id)
    progress = equipment.get_validation_progress()
    
    context = {
        'equipment': equipment,
        'progress': progress,
    }
    return render(request, 'partials/equipment_progress.html', context)


def equipment(request):
    """Equipment list view - shows all equipment with their specifications."""
    equipment_list = Equipment.objects.all()
    
    # Dropdown options (matching React constants)
    dropdown_options = {
        'owners': ['Customer', 'Preh'],
        'power_supply': ['AC 220V 50HZ single phase', 'AC 400V 50Hz 3~/N/PE - max. 32A', 'DC 24V'],
        'power_kw': ['', '1', '1.5', '2', '2.5', '3'],
        'air_supply_bar': ['no', '6', '8'],
        'air_supply_diam': ['no', '12', '16'],
    }
    
    context = {
        'active_view': 'equipment',
        'page_title': 'Equipment List',
        'equipment_list': equipment_list,
        'dropdown_options': dropdown_options,
    }
    return render(request, 'equipment_list.html', context)


@require_POST
def equipment_add(request):
    """HTMX: Add a new equipment row."""
    # Create with default values
    new_num = Equipment.objects.count() + 1
    station_name = f"NEW-{new_num}"
    
    equipment = Equipment.objects.create(
        station=station_name,
        owner="Preh",
        eq_number="",
        power_supply="AC 220V 50HZ single phase",
        power_kw="1",
        air_supply_bar="no",
        air_supply_diam="no",
    )
    
    # Auto-create default devices with IP addresses for this equipment
    base_ip = 100 + new_num  # Generate unique IP range for each new equipment
    default_devices = [
        ("PLC 1217C DC/DC/DC", f"{station_name}=PLC-KF1", f"172.19.123.{base_ip}"),
        ("WAGO", f"{station_name}=PLC-KF2", f"172.19.123.{base_ip + 50}"),
        ("HMI KTP700", f"KTP700_{station_name}", f"172.19.123.{base_ip + 100}"),
        ("Vision Sensor", f"{station_name}-ST10-CR", f"172.19.123.{base_ip + 150}"),
    ]
    
    for device_type, name, ip in default_devices:
        EquipmentDevice.objects.create(
            equipment=equipment,
            device_type=device_type,
            name=name,
            ip_address=ip
        )
    
    dropdown_options = {
        'owners': ['Customer', 'Preh'],
        'power_supply': ['AC 220V 50HZ single phase', 'AC 400V 50Hz 3~/N/PE - max. 32A', 'DC 24V'],
        'power_kw': ['', '1', '1.5', '2', '2.5', '3'],
        'air_supply_bar': ['no', '6', '8'],
        'air_supply_diam': ['no', '12', '16'],
    }
    
    context = {
        'equip': equipment,
        'dropdown_options': dropdown_options,
    }
    return render(request, 'partials/equipment_row.html', context)


@require_POST
def equipment_update(request, equipment_id):
    """HTMX: Update a single field of equipment."""
    equipment = get_object_or_404(Equipment, pk=equipment_id)
    field = request.POST.get('field')
    value = request.POST.get('value', '')
    
    allowed_fields = ['station', 'owner', 'eq_number', 'power_supply', 'power_kw', 'air_supply_bar', 'air_supply_diam', 'height', 'width', 'length', 'weight', 'photo_front', 'photo_tag']
    
    if field in allowed_fields:
        setattr(equipment, field, value)
        equipment.save()
        
        # Calculate new progress percentage
        progress = equipment.get_validation_progress()
        if progress == 100:
            color_class = 'text-green-500'
        elif progress >= 50:
            color_class = 'text-orange-500'
        else:
            color_class = 'text-gray-400'
        
        # Return OOB swap to update the percentage cell
        html = f'''<span id="progress-{equipment.id}" hx-swap-oob="true" class="text-xs font-bold {color_class}">{progress}%</span>'''
        return HttpResponse(html)
    
    return HttpResponse("Invalid field", status=400)


@require_POST
def equipment_delete(request, equipment_id):
    """HTMX: Delete an equipment row."""
    equipment = get_object_or_404(Equipment, pk=equipment_id)
    equipment.delete()
    return HttpResponse("")  # Empty response removes the row


def equipment_ips(request):
    """Equipment IPs view - shows devices with IP addresses grouped by equipment."""
    # Show ALL equipment, not just those with devices
    equipment_list = Equipment.objects.prefetch_related('devices').all()
    
    context = {
        'active_view': 'equipment_ips',
        'page_title': 'Equipment IPs',
        'equipment_list': equipment_list,
    }
    return render(request, 'equipment_ips.html', context)


def equipment_photos(request):
    """Equipment Photos view - gallery of equipment photos."""
    equipment_list = Equipment.objects.all()
    
    context = {
        'active_view': 'equipment_photos',
        'page_title': 'Equipment Photos',
        'equipment_list': equipment_list,
    }
    return render(request, 'equipment_photos.html', context)


@require_POST
def device_add(request, equipment_id):
    """HTMX: Add a new device row to an equipment."""
    equipment = get_object_or_404(Equipment, pk=equipment_id)
    
    # Create with default PLC values
    device = EquipmentDevice.objects.create(
        equipment=equipment,
        device_type="PLC",
        name=f"{equipment.station}-PLC",
        ip_address=""
    )
    
    # Return the new row HTML (matching new template format with trash icon first)
    html = f'''<tr id="device-row-{device.id}" class="hover:bg-gray-800/50 group">
        <td class="p-0 text-center border-r border-gray-700"><button onclick="confirmDeviceDelete({device.id})" class="p-2 text-red-500 hover:text-red-400 transition-colors"><i data-lucide="trash-2" class="w-3 h-3"></i></button></td>
        <td class="p-0 border-r border-gray-700"><input class="w-full bg-transparent p-2 focus:outline-none focus:bg-gray-700 text-gray-200" value="{device.device_type}" hx-post="/device/update/{device.id}/" hx-trigger="change" hx-vals='{{"field": "device_type"}}' hx-swap="none" name="value"></td>
        <td class="p-0 border-r border-gray-700"><input class="w-full bg-transparent p-2 focus:outline-none focus:bg-gray-700 text-gray-200" value="{device.name}" hx-post="/device/update/{device.id}/" hx-trigger="change" hx-vals='{{"field": "name"}}' hx-swap="none" name="value"></td>
        <td class="p-0"><input class="w-full bg-transparent p-2 focus:outline-none focus:bg-gray-700 font-mono text-preh-light-blue" value="" hx-post="/device/update/{device.id}/" hx-trigger="change" hx-vals='{{"field": "ip_address"}}' hx-swap="none" name="value"></td>
    </tr>'''
    
    # OOB swap to remove "No devices" empty row for this equipment
    oob_remove_empty = f'''<tr id="empty-row-{equipment_id}" hx-swap-oob="delete"></tr>'''
    
    return HttpResponse(html + oob_remove_empty)


@require_POST
def device_update(request, device_id):
    """HTMX: Update a single field of a device."""
    device = get_object_or_404(EquipmentDevice, pk=device_id)
    field = request.POST.get('field')
    value = request.POST.get('value', '')
    
    allowed_fields = ['device_type', 'name', 'ip_address']
    
    if field in allowed_fields:
        setattr(device, field, value)
        device.save()
        return HttpResponse(value or '')
    
    return HttpResponse("Invalid field", status=400)


@require_POST
def device_delete(request, device_id):
    """HTMX: Delete a device row."""
    device = get_object_or_404(EquipmentDevice, pk=device_id)
    device.delete()
    return HttpResponse("")  # Empty response removes the row


# --- DOCUMENTATION CHECKLIST VIEWS ---

# Translation dictionary (matching React translations.ts)
DOC_TRANSLATIONS = {
    'docGeneral': '1. Documentație Tehnică Generală',
    'docGeneralDesc': 'Manuale, layout-uri și specificații.',
    'docUserManual': 'Manual de Operare (Pornire/Oprire, Changeover)',
    'docLayout': 'Layout Linie/Stație (2D și 3D)',
    'docTechSpecs': 'Specificații Tehnice (Ciclu timp, Energie)',
    
    'docElectrical': '2. Documentație Electrică și Software',
    'docElectricalDesc': 'Scheme, backup-uri cod și liste I/O.',
    'docEPlan': 'Scheme Electrice (E-Plan)',
    'docPneumatic': 'Scheme Pneumatice și Hidraulice',
    'docIOList': 'Listă Intrări/Ieșiri (Mapare Senzori)',
    'docBackup': 'Backup Software (PLC, HMI, Robot, Vision)',
    'docAlarmList': 'Listă Erori și Depanare',
    
    'docMaintenance': '3. Mentenanță și Piese de Schimb',
    'docMaintenanceDesc': 'Planuri PM și BOM piese schimb.',
    'docPMPlan': 'Plan Mentenanță Preventivă',
    'docSpareParts': 'Listă Piese de Schimb (Critice și Uzură)',
    'docMechDrawings': 'Desene Mecanice de Ansamblu',
    
    'docQuality': '4. Calitate și Validare',
    'docQualityDesc': 'Conformitate CE, studii capabilitate și MSA.',
    'docCE': 'Certificat de Conformitate CE',
    'docRisk': 'Analiză de Risc (ISO 12100)',
    'docCapability': 'Raport Capabilitate (Cmk/Cpk ≥ 1.67)',
    'docMSA': 'Raport MSA (Gage R&R)',
    'docParams': 'Listă Parametri de Proces',
    
    'docSafety': '5. Siguranță',
    'docSafetyDesc': 'Validare siguranță și proceduri LOTO.',
    'docSafetyVal': 'Raport Validare Siguranță (PL)',
    'docLOTO': 'Instrucțiuni LOTO',
    
    'docTraining': '6. Training',
    'docTrainingDesc': 'Materiale și registre prezență.',
    'docTrainingMat': 'Materiale Training (Operatori/Mentenanță)',
    'docTrainingReg': 'Registru Training (Semnat)',
    
    'iatf2025': 'IATF 16949 (Focus 2025)',
    'docTraceability': 'Protocol Trasabilitate (Integrare MES)',
    'docCybersecurity': 'Documentație Securitate Cibernetică Echipament',
}


def get_equipment_doc_progress(equipment):
    """Calculate documentation progress percentage for an equipment."""
    total_items = DocumentationChecklistItem.objects.count()
    if total_items == 0:
        return 0
    checked_count = equipment.documentation_results.filter(is_checked=True).count()
    return round((checked_count / total_items) * 100)


def documentation(request):
    """Documentation Checklist main view with equipment sidebar."""
    equipment_list = Equipment.objects.all()
    categories = list(DocumentationCategory.objects.prefetch_related('items').all())
    
    # Attach translated titles directly to categories and items
    for category in categories:
        category.translated_title = DOC_TRANSLATIONS.get(category.title_key, category.title_key)
        category.translated_desc = DOC_TRANSLATIONS.get(category.desc_key, '') if category.desc_key else ''
        for item in category.items.all():
            item.translated_text = DOC_TRANSLATIONS.get(item.item_key, item.item_key)
    
    # Get selected equipment (default to first)
    selected_id = request.GET.get('equipment_id')
    if selected_id:
        selected_equipment = get_object_or_404(Equipment, pk=selected_id)
    else:
        selected_equipment = equipment_list.first()
    
    # Get existing results for selected equipment
    results = {}
    if selected_equipment:
        for result in selected_equipment.documentation_results.all():
            results[result.checklist_item_id] = result.is_checked
    
    # Calculate progress for each equipment (for sidebar)
    equipment_progress = {}
    for equip in equipment_list:
        equipment_progress[equip.id] = get_equipment_doc_progress(equip)
    
    # Current equipment progress
    total_items = DocumentationChecklistItem.objects.count()
    checked_count = len([v for v in results.values() if v])
    current_progress = round((checked_count / total_items) * 100) if total_items > 0 else 0
    
    context = {
        'active_view': 'documentation',
        'page_title': 'Documentație',
        'equipment_list': equipment_list,
        'selected_equipment': selected_equipment,
        'categories': categories,
        'results': results,
        'equipment_progress': equipment_progress,
        'current_progress': current_progress,
        'total_items': total_items,
        'checked_count': checked_count,
    }
    return render(request, 'documentation.html', context)


def documentation_checklist_partial(request, equipment_id):
    """HTMX partial: Returns checklist sections for a specific equipment."""
    equipment = get_object_or_404(Equipment, pk=equipment_id)
    categories = DocumentationCategory.objects.prefetch_related('items').all()
    
    # Get existing results for this equipment
    results = {}
    for result in equipment.documentation_results.all():
        results[result.checklist_item_id] = result.is_checked
    
    total_items = DocumentationChecklistItem.objects.count()
    checked_count = len([v for v in results.values() if v])
    current_progress = round((checked_count / total_items) * 100) if total_items > 0 else 0
    
    context = {
        'selected_equipment': equipment,
        'categories': categories,
        'results': results,
        'current_progress': current_progress,
        'total_items': total_items,
        'checked_count': checked_count,
        'translations': DOC_TRANSLATIONS,
    }
    return render(request, 'partials/documentation_checklist.html', context)


@require_POST
def toggle_documentation_item(request, equipment_id, item_id):
    """HTMX endpoint: Toggle a checklist item on/off."""
    equipment = get_object_or_404(Equipment, pk=equipment_id)
    checklist_item = get_object_or_404(DocumentationChecklistItem, pk=item_id)
    
    # Get or create the result
    result, created = DocumentationResult.objects.get_or_create(
        equipment=equipment,
        checklist_item=checklist_item,
        defaults={'is_checked': True}
    )
    
    if not created:
        result.is_checked = not result.is_checked
        result.save()
    
    # Calculate updated progress
    total_items = DocumentationChecklistItem.objects.count()
    checked_count = equipment.documentation_results.filter(is_checked=True).count()
    progress = round((checked_count / total_items) * 100) if total_items > 0 else 0
    
    # Determine color class
    if progress == 100:
        color_class = 'text-green-400'
    elif progress >= 50:
        color_class = 'text-yellow-400'
    else:
        color_class = 'text-gray-400'
    
    # Return checkbox + OOB swap for progress elements
    is_checked = result.is_checked
    item_text = DOC_TRANSLATIONS.get(checklist_item.item_key, checklist_item.item_key)
    
    checkbox_html = f'''
    <div id="doc-item-{item_id}" 
         class="flex items-center gap-3 p-2 rounded hover:bg-gray-700/50 cursor-pointer transition-colors"
         hx-post="/documentation/toggle/{equipment_id}/{item_id}/"
         hx-swap="outerHTML">
        <div class="w-5 h-5 rounded border flex items-center justify-center transition-colors {'bg-green-500 border-green-500 text-white' if is_checked else 'border-gray-500 bg-gray-800'}">
            {'<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>' if is_checked else ''}
        </div>
        <span class="text-sm {'text-gray-500 line-through' if is_checked else 'text-gray-200'}">
            {item_text}
        </span>
    </div>
    '''
    
    # OOB swap for header progress
    header_oob = f'''
    <span id="header-progress" hx-swap-oob="true" class="text-2xl font-bold {color_class}">{progress}%</span>
    '''
    
    # OOB swap for progress bar
    bar_oob = f'''
    <div id="progress-bar" hx-swap-oob="true" class="{'bg-green-500' if progress == 100 else 'bg-blue-500'} h-2.5 rounded-full transition-all duration-500" style="width: {progress}%;"></div>
    '''
    
    # OOB swap for checked count
    count_oob = f'''
    <span id="checked-count" hx-swap-oob="true">{checked_count} / {total_items}</span>
    '''
    
    # OOB swap for sidebar progress badge
    if progress == 100:
        badge_class = 'bg-green-900/30 text-green-400'
    else:
        badge_class = 'bg-gray-700 text-gray-400'
    
    sidebar_oob = f'''
    <span id="sidebar-progress-{equipment.id}" hx-swap-oob="true" class="text-[10px] px-1.5 py-0.5 rounded-full {badge_class}">{progress}%</span>
    '''
    
    return HttpResponse(checkbox_html + header_oob + bar_oob + count_oob + sidebar_oob)


# --- BOM VIEWS ---

def get_contrast_color(hex_color):
    """Calculate if text should be black or white based on background color."""
    hex_color = hex_color.lstrip('#')
    if len(hex_color) != 6:
        return '#000000'
    r, g, b = tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))
    luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
    return '#000000' if luminance > 0.5 else '#FFFFFF'


def bom(request):
    """BOM main view with editable table and variant columns."""
    active_tab = request.GET.get('tab', 'bom')
    variants = Variant.objects.all()
    bom_items = BomItem.objects.prefetch_related('item_variants__variant').all()
    history_items = DocHistoryItem.objects.all()
    
    # Build variant matrix for each BOM item
    bom_data = []
    for item in bom_items:
        item_variants = {iv.variant_id: iv.is_applicable for iv in item.item_variants.all()}
        bom_data.append({
            'item': item,
            'variant_status': {v.id: item_variants.get(v.id, False) for v in variants}
        })
    
    context = {
        'active_view': 'bom',
        'page_title': 'BOM',
        'active_tab': active_tab,
        'variants': variants,
        'bom_data': bom_data,
        'history_items': history_items,
        'get_contrast_color': get_contrast_color,
    }
    return render(request, 'bom.html', context)


@require_POST
def bom_add_row(request):
    """HTMX: Add a new BOM item row."""
    # Find max order
    max_order = BomItem.objects.order_by('-order').values_list('order', flat=True).first() or 0
    
    new_item = BomItem.objects.create(
        station='',
        part_number='',
        description='',
        quantity=1,
        order=max_order + 1
    )
    
    # Create variant entries for this item
    variants = Variant.objects.all()
    for variant in variants:
        BomItemVariant.objects.create(bom_item=new_item, variant=variant, is_applicable=False)
    
    # Return HTML for the new row
    item_variants = {iv.variant_id: iv.is_applicable for iv in new_item.item_variants.all()}
    
    html = render_bom_row(new_item, variants, item_variants)
    return HttpResponse(html)


def render_bom_row(item, variants, item_variants):
    """Helper to render a single BOM row HTML."""
    variant_cells = ''
    for v in variants:
        is_applicable = item_variants.get(v.id, False)
        contrast = get_contrast_color(v.color)
        x_mark = f'<span class="font-bold text-lg select-none" style="color: {contrast}">X</span>' if is_applicable else ''
        variant_cells += f'''
        <td class="p-1 text-center cursor-pointer border-r border-gray-200 dark:border-gray-700"
            style="background-color: {v.color}"
            hx-post="/bom/toggle/{item.id}/{v.id}/"
            hx-swap="outerHTML"
            hx-target="#bom-row-{item.id}">
            <div class="flex items-center justify-center h-full">{x_mark}</div>
        </td>
        '''
    
    return f'''
    <tr id="bom-row-{item.id}" class="group hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors">
        <td class="p-1 sticky left-0 bg-inherit z-10 border-r dark:border-gray-700">
            <input value="{item.station}" 
                   name="station"
                   hx-post="/bom/update/{item.id}/"
                   hx-trigger="blur changed"
                   hx-swap="none"
                   class="w-full bg-transparent p-2 focus:outline-none dark:text-white font-medium" />
        </td>
        <td class="p-1 border-r dark:border-gray-700">
            <input value="{item.part_number}"
                   name="part_number"
                   hx-post="/bom/update/{item.id}/"
                   hx-trigger="blur changed"
                   hx-swap="none"
                   class="w-full bg-transparent p-2 focus:outline-none dark:text-white font-mono" />
        </td>
        <td class="p-1 border-r dark:border-gray-700">
            <input value="{item.description}"
                   name="description"
                   hx-post="/bom/update/{item.id}/"
                   hx-trigger="blur changed"
                   hx-swap="none"
                   class="w-full bg-transparent p-2 focus:outline-none dark:text-white" />
        </td>
        <td class="p-1 border-r dark:border-gray-700">
            <input type="number" value="{item.quantity}"
                   name="quantity"
                   hx-post="/bom/update/{item.id}/"
                   hx-trigger="blur changed"
                   hx-swap="none"
                   class="w-full bg-transparent p-2 text-center focus:outline-none dark:text-white" />
        </td>
        {variant_cells}
        <td class="p-1 text-center">
            <button hx-post="/bom/delete/{item.id}/"
                    hx-confirm="Ștergeți acest rând?"
                    hx-target="#bom-row-{item.id}"
                    hx-swap="outerHTML"
                    class="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                <i data-lucide="trash-2" class="w-4 h-4"></i>
            </button>
        </td>
    </tr>
    '''


@require_POST
def bom_update_field(request, item_id):
    """HTMX: Update a single field of a BOM item."""
    item = get_object_or_404(BomItem, pk=item_id)
    
    for field in ['station', 'part_number', 'description', 'quantity']:
        if field in request.POST:
            value = request.POST.get(field)
            if field == 'quantity':
                value = int(value) if value else 1
            setattr(item, field, value)
    
    item.save()
    return HttpResponse('')


@require_POST
def bom_delete_row(request, item_id):
    """HTMX: Delete a BOM item row."""
    item = get_object_or_404(BomItem, pk=item_id)
    item.delete()
    return HttpResponse('')


@require_POST
def bom_toggle_variant(request, item_id, variant_id):
    """HTMX: Toggle variant applicability for a BOM item."""
    item = get_object_or_404(BomItem, pk=item_id)
    variant = get_object_or_404(Variant, pk=variant_id)
    
    biv, created = BomItemVariant.objects.get_or_create(
        bom_item=item,
        variant=variant,
        defaults={'is_applicable': True}
    )
    
    if not created:
        biv.is_applicable = not biv.is_applicable
        biv.save()
    
    # Re-render the entire row
    variants = Variant.objects.all()
    item_variants = {iv.variant_id: iv.is_applicable for iv in item.item_variants.all()}
    
    return HttpResponse(render_bom_row(item, variants, item_variants))


@require_POST
def bom_add_variant(request):
    """HTMX: Add a new variant column."""
    name = request.POST.get('name', '').strip()
    if not name:
        return HttpResponse('', status=400)
    
    if Variant.objects.filter(name=name).exists():
        return HttpResponse('Variant already exists', status=400)
    
    # Default colors cycle
    colors = ['#bdd7ee', '#f8cbad', '#c6efce', '#ffeb9c', '#d9d9d9', '#ffd966']
    max_order = Variant.objects.order_by('-order').values_list('order', flat=True).first() or 0
    color = colors[max_order % len(colors)]
    
    variant = Variant.objects.create(name=name, color=color, order=max_order + 1)
    
    # Create variant entries for all existing BOM items
    for item in BomItem.objects.all():
        BomItemVariant.objects.get_or_create(bom_item=item, variant=variant, defaults={'is_applicable': False})
    
    # Return redirect to refresh the page
    return HttpResponse('', headers={'HX-Redirect': '/bom/'})


@require_POST
def bom_update_variant_color(request, variant_id):
    """HTMX: Update variant column color."""
    variant = get_object_or_404(Variant, pk=variant_id)
    color = request.POST.get('color', '#bdd7ee')
    variant.color = color
    variant.save()
    return HttpResponse('', headers={'HX-Redirect': '/bom/'})


# --- VISUAL AIDS VIEWS ---

def visual_aids(request):
    """Visual Aids main view."""
    bom_items = BomItem.objects.prefetch_related('item_variants__variant').all()
    variants = Variant.objects.all()
    
    context = {
        'active_view': 'visual_aids',
        'page_title': 'Visual Aids',
        'bom_items': bom_items,
        'variants': variants,
    }
    return render(request, 'visual_aids.html', context)


@require_POST
def visual_aids_update_color(request, item_id):
    """HTMX: Update visual aid background color."""
    item = get_object_or_404(BomItem, pk=item_id)
    color = request.POST.get('color', '#CCFFFF')
    item.visual_aid_bg_color = color
    item.save()
    return HttpResponse('')


@require_POST
def visual_aids_upload_image(request, item_id):
    """HTMX: Upload image for a BOM item."""
    item = get_object_or_404(BomItem, pk=item_id)
    
    if 'image' in request.FILES:
        item.image = request.FILES['image']
        item.save()
        # Return updated image thumbnail
        if item.image:
            return HttpResponse(f'<img src="{item.image.url}" class="h-8 w-8 object-cover rounded" />')
    
    return HttpResponse('<i data-lucide="image" class="w-5 h-5 text-gray-400"></i>')


def visual_aids_export_pdf(request):
    """Generate PDF export of Visual Aids."""
    # Get selected items from POST
    selected_ids = request.POST.getlist('selected_items')
    
    if not selected_ids:
        bom_items = BomItem.objects.all()
    else:
        bom_items = BomItem.objects.filter(pk__in=selected_ids)
    
    # For now, return a simple response - full PDF generation would require reportlab
    from django.http import HttpResponse
    response = HttpResponse(content_type='text/plain')
    response['Content-Disposition'] = 'attachment; filename="visual_aids.txt"'
    
    for item in bom_items:
        response.write(f"Station: {item.station}\n")
        response.write(f"Part Number: {item.part_number}\n")
        response.write(f"Description: {item.description}\n")
        response.write("-" * 40 + "\n")
    
    return response


def visual_aids_export_docx(request):
    """Generate DOCX export of Visual Aids."""
    selected_ids = request.POST.getlist('selected_items')
    
    if not selected_ids:
        bom_items = BomItem.objects.all()
    else:
        bom_items = BomItem.objects.filter(pk__in=selected_ids)
    
    # For now, return a simple response - full DOCX generation would require python-docx
    from django.http import HttpResponse
    response = HttpResponse(content_type='text/plain')
    response['Content-Disposition'] = 'attachment; filename="visual_aids.txt"'
    
    for item in bom_items:
        response.write(f"Station: {item.station}\n")
        response.write(f"Part Number: {item.part_number}\n")
        response.write(f"Description: {item.description}\n")
        response.write("-" * 40 + "\n")
    
    return response
