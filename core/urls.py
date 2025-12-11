from django.urls import path
from . import views

urlpatterns = [
    path('', views.dashboard, name='dashboard'),
    
    # Equipment views
    path('equipment/', views.equipment, name='equipment'),
    path('equipment/ips/', views.equipment_ips, name='equipment_ips'),
    path('equipment/photos/', views.equipment_photos, name='equipment_photos'),
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
]
