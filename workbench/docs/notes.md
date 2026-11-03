# Save File

Adding a note about how save file is approached for repo based workspace:
- Get active tab contents
- Send it to server to be saved with the file path
- After saving, server sends back confirmation
- Workbench sets the content to the updated content (indicates saved, not dirty)
- File tree re-renders the tab and icon indicating dirty file is removed
