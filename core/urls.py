from django.urls import path
from . import views

urlpatterns = [
    path('', views.dashboard, name='dashboard'),
    path('project-team/', views.project_team, name='project_team'),
    path('project-team/pdf/', views.project_team_pdf_download, name='project_team_pdf_download'),
    path('project-team/upload/', views.project_team_upload, name='project_team_upload'),
    
    # Equipment views
    path('equipment/', views.equipment, name='equipment'),
    path('equipment/ips/', views.equipment_ips, name='equipment_ips'),
    path('equipment/add/', views.equipment_add, name='equipment_add'),
    path('equipment/update/<int:equipment_id>/', views.equipment_update, name='equipment_update'),
    path('equipment/delete/<int:equipment_id>/', views.equipment_delete, name='equipment_delete'),
    
    # Device CRUD (for IPs page)
    path('device/add/<int:equipment_id>/', views.device_add, name='device_add'),
    path('device/update/<int:device_id>/', views.device_update, name='device_update'),
    path('device/delete/<int:device_id>/', views.device_delete, name='device_delete'),
    
    # Validation views
    path('validation/', views.validation, name='validation'),
    
    # HTMX partials
    path('validation/checklist/<int:equipment_id>/', views.validation_checklist_partial, name='validation_checklist_partial'),
    path('validation/submit/<int:equipment_id>/<int:item_id>/', views.submit_validation, name='submit_validation'),
    path('validation/progress/<int:equipment_id>/', views.equipment_progress_partial, name='equipment_progress_partial'),
    
    # Documentation views
    path('documentation/', views.documentation, name='documentation'),
    path('documentation/checklist/<int:equipment_id>/', views.documentation_checklist_partial, name='documentation_checklist_partial'),
    path('documentation/toggle/<int:equipment_id>/<int:item_id>/', views.toggle_documentation_item, name='toggle_documentation_item'),
    
    # BOM views
    path('bom/', views.bom, name='bom'),
    path('bom/add/', views.bom_add_row, name='bom_add_row'),
    path('bom/update/<int:item_id>/', views.bom_update_field, name='bom_update_field'),
    path('bom/delete/<int:item_id>/', views.bom_delete_row, name='bom_delete_row'),
    path('bom/toggle/<int:item_id>/<int:variant_id>/', views.bom_toggle_variant, name='bom_toggle_variant'),
    path('bom/variant/add/', views.bom_add_variant, name='bom_add_variant'),
    path('bom/variant/color/<int:variant_id>/', views.bom_update_variant_color, name='bom_update_variant_color'),
    path('bom/variant/delete/<int:variant_id>/', views.bom_delete_variant, name='bom_delete_variant'),
    
    # Visual Aids views
    path('visual-aids/', views.visual_aids, name='visual_aids'),
    path('visual-aids/color/<int:item_id>/', views.visual_aids_update_color, name='visual_aids_update_color'),
    path('visual-aids/image/<int:item_id>/', views.visual_aids_upload_image, name='visual_aids_upload_image'),
    path('visual-aids/export/pdf/', views.visual_aids_export_pdf, name='visual_aids_export_pdf'),
    path('visual-aids/export/docx/', views.visual_aids_export_docx, name='visual_aids_export_docx'),
]
