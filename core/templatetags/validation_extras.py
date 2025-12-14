from django import template

register = template.Library()


@register.filter
def get_item(dictionary, key):
    """
    Get an item from a dictionary using a variable key.
    Usage: {{ mydict|get_item:key }}
    """
    if dictionary is None:
        return None
    return dictionary.get(key)


@register.filter
def contrast_color(hex_color):
    """
    Calculate if text should be black or white based on background color luminance.
    Usage: {{ variant.color|contrast_color }}
    Returns: '#000000' for light backgrounds, '#FFFFFF' for dark backgrounds
    """
    if not hex_color:
        return '#000000'
    hex_color = hex_color.lstrip('#')
    if len(hex_color) != 6:
        return '#000000'
    try:
        r, g, b = tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))
        luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
        return '#000000' if luminance > 0.5 else '#FFFFFF'
    except (ValueError, IndexError):
        return '#000000'
