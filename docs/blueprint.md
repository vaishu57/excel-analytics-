# **App Name**: DataVis Canvas

## Core Features:

- Excel Upload and Parsing: Accepts Excel files (.xls/.xlsx) as input, reads the files, parses the information and presents an error message if the file cannot be parsed correctly.
- Dynamic Axis Selection: Dynamically assigns available spreadsheet columns as the x and y axis, presenting available options using a dropdown, using SheetJS library to display an accurate visual table
- Basic Chart Generation: Generates a simple chart (line, bar) based on the selected axes and chart type. Supports charting using the Chart.js library.
- AI Chart Suggestions: Uses AI to suggest suitable chart types and data relationships for the user's dataset, serving as a helpful tool if they do not know where to begin..
- Data Persistence: Saves uploaded data files to browser storage, allowing users to persist data between sessions.

## Style Guidelines:

- Primary color: A deep purple (#673AB7), conveying intelligence and insight without being somber. This color reflects the core analytical capabilities of the application.
- Background color: Light lavender (#F3E5F5). It is subtle but supports the visual impact of the main purple hue.
- Accent color: Soft Blue (#3F51B5). The hue is carefully chosen to sit next to purple without clashing, adding extra pop for buttons or notifications.
- Font: 'Inter', a grotesque-style sans-serif known for its clean lines, providing a modern, objective look.
- Data input section at the top; chart display beneath; options and settings to the right.
- Clean, minimalist icons to represent chart types, settings, and data options.