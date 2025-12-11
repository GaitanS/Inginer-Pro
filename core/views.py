from django.shortcuts import render, get_object_or_404
from django.http import HttpResponse
from django.views.decorators.http import require_POST
from .models import Equipment, ValidationCategory, ValidationChecklistItem, ValidationResult, EquipmentDevice


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
    
    allowed_fields = ['station', 'owner', 'eq_number', 'power_supply', 'power_kw', 'air_supply_bar', 'air_supply_diam']
    
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
    return HttpResponse(html)


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
