from django.contrib import admin
from .models import Equipment, ValidationCategory, ValidationChecklistItem, ValidationResult, EquipmentDevice


@admin.register(Equipment)
class EquipmentAdmin(admin.ModelAdmin):
    list_display = ['station', 'owner', 'eq_number', 'power_supply']
    list_filter = ['owner']
    search_fields = ['station', 'eq_number']


@admin.register(ValidationCategory)
class ValidationCategoryAdmin(admin.ModelAdmin):
    list_display = ['code', 'title', 'order']
    ordering = ['order']


@admin.register(ValidationChecklistItem)
class ValidationChecklistItemAdmin(admin.ModelAdmin):
    list_display = ['category', 'ref_iatf', 'ref_vda', 'order']
    list_filter = ['category']
    ordering = ['category__order', 'order']


@admin.register(ValidationResult)
class ValidationResultAdmin(admin.ModelAdmin):
    list_display = ['equipment', 'checklist_item', 'status', 'validated_at']
    list_filter = ['status', 'equipment']
    search_fields = ['equipment__station']


@admin.register(EquipmentDevice)
class EquipmentDeviceAdmin(admin.ModelAdmin):
    list_display = ['equipment', 'device_type', 'name', 'ip_address']
    list_filter = ['device_type', 'equipment']
    search_fields = ['name', 'ip_address']
