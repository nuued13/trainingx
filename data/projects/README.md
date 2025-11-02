# Projects Data Structure

This directory contains a modular structure for all training projects, making it easier to manage and update individual projects.

## Structure

```
projects/
├── README.md                    # This documentation file
├── index.ts                     # Main export file that imports all projects
├── social-media-content.json    # Individual project files
├── study-guide-builder.json
├── presentation-designer.json
├── level-1-assessment.json
├── quiz-master.json
├── business-analyst.json
├── website-builder.json
├── level-2-assessment.json
├── financial-advisor.json
├── customer-success-specialist.json
├── strategic-planner.json
└── level-3-assessment.json
```

## Usage

### Importing All Projects

```typescript
import projects from "@/data/projects";
// Returns an array of all project objects
```

### Individual Project Structure

Each project file follows this structure:

```json
{
  "slug": "unique-project-identifier",
  "title": "Human-readable project title",
  "category": "Project category",
  "level": 1,
  "levelOrder": 1,
  "estTime": "10m",
  "difficulty": 1,
  "badge": "badge-identifier",
  "steps": 3,
  "stepDetails": [
    {
      "type": "multiple-choice",
      "question": "Question text",
      "options": [
        {
          "quality": "bad|almost|good",
          "text": "Option text",
          "explanation": "Explanation for why this option is good/bad"
        }
      ]
    }
  ],
  "buildsSkills": ["skill1", "skill2"],
  "description": "Project description",
  "isAssessment": false,
  "requiresCompletion": ["project-slug-1", "project-slug-2"]
}
```

## Adding New Projects

1. Create a new JSON file with the project's slug as the filename (e.g., `new-project.json`)
2. Follow the project structure shown above
3. Update `index.ts` to import and export the new project:
   ```typescript
   import newproject from './new-project.json';

   export default [
     // ... existing projects
     newproject,
   ];
   ```

## Updating Existing Projects

Simply edit the corresponding JSON file. The changes will be automatically reflected wherever the projects are imported.

## Benefits of This Structure

- **Modular**: Each project is in its own file, making it easy to manage
- **Maintainable**: Updates to one project don't risk affecting others
- **Scalable**: Easy to add new projects without modifying a large monolithic file
- **Searchable**: Individual project files are easier to search and navigate
- **Collaboration-friendly**: Multiple team members can work on different projects simultaneously