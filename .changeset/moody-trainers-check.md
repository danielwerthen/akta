---
'akta': minor
---

Update element props

Simpler approach to event handlers, remove the cleanup and hope that the element is garbage collected to avoid any leaked event handlers.

Handle null or undefined className in observable sequence
