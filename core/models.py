from django.db import models


class Equipment(models.Model):
    """Stores equipment/station data for the production line."""
    OWNER_CHOICES = [
        ('Customer', 'Customer'),
        ('Preh', 'Preh'),
    ]

    station = models.CharField(max_length=50)
    owner = models.CharField(max_length=50, choices=OWNER_CHOICES)
    eq_number = models.CharField(max_length=50, verbose_name="Equipment Number")
    power_supply = models.CharField(max_length=100)
    power_kw = models.CharField(max_length=20, blank=True)
    air_supply_bar = models.CharField(max_length=20, default='no')
    air_supply_diam = models.CharField(max_length=20, default='no')
    # Photo fields
    photo_front = models.URLField(blank=True, verbose_name="Front Photo URL")
    photo_tag = models.URLField(blank=True, verbose_name="Tag Photo URL")

    class Meta:
        ordering = ['id']
        verbose_name_plural = "Equipment"

    def __str__(self):
        return f"{self.station} ({self.eq_number})"

    def get_validation_progress(self):
        """Calculate validation progress percentage based on OK results."""
        from core.models import ValidationChecklistItem
        total_items = ValidationChecklistItem.objects.count()
        if total_items == 0:
            return 0
        # Count only OK results (NOK doesn't count as progress)
        ok_count = self.validation_results.filter(status='OK').count()
        return round((ok_count / total_items) * 100)
    
    def get_device_completion(self):
        """Calculate completion percentage based on device rows with all fields filled."""
        devices = self.devices.all()
        total_devices = devices.count()
        if total_devices == 0:
            return 0
        complete_devices = sum(1 for d in devices if d.is_complete())
        return round((complete_devices / total_devices) * 100)


class ValidationCategory(models.Model):
    """Groups validation checklist items into categories (Safety, Hardware, etc.)."""
    code = models.CharField(max_length=50, unique=True)  # e.g., 'safety'
    title = models.CharField(max_length=200)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order']
        verbose_name_plural = "Validation Categories"

    def __str__(self):
        return self.title


class ValidationChecklistItem(models.Model):
    """Individual test items within a validation category."""
    category = models.ForeignKey(
        ValidationCategory,
        on_delete=models.CASCADE,
        related_name='items'
    )
    ref_iatf = models.CharField(max_length=100, verbose_name="IATF Reference")
    ref_vda = models.CharField(max_length=100, verbose_name="VDA Reference")
    test = models.TextField(verbose_name="Test Description")
    expected = models.TextField(verbose_name="Expected Result")
    example = models.TextField(blank=True, verbose_name="Example")
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['category__order', 'order']

    def __str__(self):
        return f"{self.category.code}_{self.order}: {self.test[:50]}..."


class ValidationResult(models.Model):
    """Stores OK/NOK results per equipment per checklist item."""
    STATUS_CHOICES = [
        ('OK', 'OK'),
        ('NOK', 'NOK'),
    ]

    equipment = models.ForeignKey(
        Equipment,
        on_delete=models.CASCADE,
        related_name='validation_results'
    )
    checklist_item = models.ForeignKey(
        ValidationChecklistItem,
        on_delete=models.CASCADE,
        related_name='results'
    )
    status = models.CharField(max_length=3, choices=STATUS_CHOICES)
    validated_at = models.DateTimeField(auto_now=True)
    validated_by = models.CharField(max_length=100, blank=True)

    class Meta:
        unique_together = ['equipment', 'checklist_item']
        ordering = ['checklist_item__category__order', 'checklist_item__order']

    def __str__(self):
        return f"{self.equipment.station} - {self.checklist_item} = {self.status}"


class EquipmentDevice(models.Model):
    """Stores IP addresses and device info for equipment (PLCs, HMIs, Vision Sensors, etc.)."""
    equipment = models.ForeignKey(
        Equipment,
        on_delete=models.CASCADE,
        related_name='devices'
    )
    device_type = models.CharField(max_length=100, verbose_name="Equipment Type", blank=True)
    name = models.CharField(max_length=100, blank=True)
    ip_address = models.CharField(max_length=45, blank=True)  # Changed to CharField to allow empty

    class Meta:
        ordering = ['equipment__id', 'id']

    def __str__(self):
        return f"{self.name} ({self.ip_address})"
    
    def is_complete(self):
        """Returns True if all 3 fields are filled."""
        return bool(self.device_type and self.name and self.ip_address)


class DocumentationCategory(models.Model):
    """Categories for documentation checklist (General, Electrical, etc.)."""
    code = models.CharField(max_length=50, unique=True)  # e.g., 'general', 'electrical'
    title_key = models.CharField(max_length=50)  # Translation key for title
    desc_key = models.CharField(max_length=50, blank=True)  # Translation key for description
    order = models.PositiveIntegerField(default=0)
    is_highlighted = models.BooleanField(default=False)  # For IATF2025 special styling

    class Meta:
        ordering = ['order']
        verbose_name_plural = "Documentation Categories"

    def __str__(self):
        return f"{self.code}: {self.title_key}"


class DocumentationChecklistItem(models.Model):
    """Individual checklist items within a documentation category."""
    category = models.ForeignKey(
        DocumentationCategory,
        on_delete=models.CASCADE,
        related_name='items'
    )
    item_key = models.CharField(max_length=50)  # Translation key for the item text
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['category__order', 'order']

    def __str__(self):
        return f"{self.category.code}_{self.order}: {self.item_key}"


class DocumentationResult(models.Model):
    """Stores checked/unchecked state per equipment per checklist item."""
    equipment = models.ForeignKey(
        Equipment,
        on_delete=models.CASCADE,
        related_name='documentation_results'
    )
    checklist_item = models.ForeignKey(
        DocumentationChecklistItem,
        on_delete=models.CASCADE,
        related_name='results'
    )
    is_checked = models.BooleanField(default=False)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['equipment', 'checklist_item']
        ordering = ['checklist_item__category__order', 'checklist_item__order']

    def __str__(self):
        status = "✓" if self.is_checked else "○"
        return f"{self.equipment.station} - {self.checklist_item.item_key} = {status}"


# --- BOM AND VISUAL AIDS MODELS ---

class Variant(models.Model):
    """Product variants with custom colors for BOM matrix."""
    name = models.CharField(max_length=100, unique=True)
    color = models.CharField(max_length=7, default='#bdd7ee')  # Hex color
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return self.name


class BomItem(models.Model):
    """Bill of Materials items."""
    station = models.CharField(max_length=100)
    part_number = models.CharField(max_length=100, verbose_name="Material/Part Number")
    description = models.TextField(blank=True)
    quantity = models.PositiveIntegerField(default=1)
    visual_aid_bg_color = models.CharField(max_length=7, default='#CCFFFF')
    image = models.ImageField(upload_to='bom_images/', blank=True, null=True)
    order = models.PositiveIntegerField(default=0)
    variants = models.ManyToManyField(Variant, through='BomItemVariant', related_name='bom_items')

    class Meta:
        ordering = ['order', 'station']

    def __str__(self):
        return f"{self.station} - {self.part_number}"


class BomItemVariant(models.Model):
    """Through table linking BOM items to variants with applicability status."""
    bom_item = models.ForeignKey(BomItem, on_delete=models.CASCADE, related_name='item_variants')
    variant = models.ForeignKey(Variant, on_delete=models.CASCADE, related_name='variant_items')
    is_applicable = models.BooleanField(default=False)

    class Meta:
        unique_together = ['bom_item', 'variant']

    def __str__(self):
        status = "X" if self.is_applicable else "-"
        return f"{self.bom_item.part_number} | {self.variant.name}: {status}"


class DocHistoryItem(models.Model):
    """Document history/revision entries."""
    version = models.CharField(max_length=10)
    register = models.CharField(max_length=100)
    changes = models.TextField()
    created_by = models.CharField(max_length=100)
    date_created = models.DateField()
    released_by = models.CharField(max_length=100)
    date_released = models.DateField()
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"v{self.version} - {self.changes[:50]}"
