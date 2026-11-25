import type {
  ComputerSkillAttempt,
  ComputerSkillBenchmark,
  ComputerSkillPracticalTaskSpec,
  ComputerSkillTaskResult,
  SchoolClassNumber,
} from '../types';

// ============================================================================
// CLASS 1 TO CLASS 12 COMPUTER SKILL BENCHMARKS & PRACTICAL SANDBOX ENGINE
// ============================================================================

interface ClassBlueprint {
  classLevel: SchoolClassNumber;
  tierLabel: string;
  targetWpm: number;
  targetAccuracyPct: number;
  typingDurationSec: number;
  practicalFocus: string;
  typingPassage: string;
  tasks: ComputerSkillPracticalTaskSpec[];
}

const CLASS_BLUEPRINTS: ClassBlueprint[] = [
  {
    classLevel: 1,
    tierLabel: 'Foundational (Class 1)',
    targetWpm: 8,
    targetAccuracyPct: 80,
    typingDurationSec: 60,
    practicalFocus: 'Basic copy-paste, moving a picture into a folder, and naming a file.',
    typingPassage: 'cat dog sun cup pen hat red bag box fan mat run hop big top',
    tasks: [
      {
        id: 'c1-copy',
        kind: 'copy_paste',
        title: 'Copy & Paste Word',
        instruction: 'Copy the word "SUNSHINE" from the source box and paste it into the answer box.',
        points: 35,
        sourceText: 'SUNSHINE',
        targetPrompt: 'Paste the exact word here:',
      },
      {
        id: 'c1-folder',
        kind: 'folder_management',
        title: 'Move File to Drawing Folder',
        instruction: 'Move "My_Star.png" from Desktop into the "Drawings" folder.',
        points: 35,
        initialFolders: ['Desktop', 'Drawings'],
        initialFiles: [
          { id: 'f1', name: 'My_Star.png', folder: 'Desktop' },
          { id: 'f2', name: 'ABC_Song.txt', folder: 'Desktop' },
        ],
        requiredMoveFileId: 'f1',
        requiredDestinationFolder: 'Drawings',
      },
      {
        id: 'c1-format',
        kind: 'text_format_save',
        title: 'Make Title Bold & Save',
        instruction: 'Apply Bold style to the title and save the file as "my_name.txt".',
        points: 30,
        sampleDocument: 'My First Computer Class',
        requiredFormat: 'bold',
        requiredFileName: 'my_name.txt',
      },
    ],
  },
  {
    classLevel: 2,
    tierLabel: 'Foundational (Class 2)',
    targetWpm: 10,
    targetAccuracyPct: 82,
    typingDurationSec: 60,
    practicalFocus: 'Sentence copy-paste, creating a folder, moving a file, and bold + underline formatting.',
    typingPassage: 'The sun rises in the east. Birds sing in the green park every morning.',
    tasks: [
      {
        id: 'c2-copy',
        kind: 'copy_paste',
        title: 'Copy & Paste Short Sentence',
        instruction: 'Copy the sentence from the source card and paste it cleanly into the document box.',
        points: 35,
        sourceText: 'I keep my computer desk neat and clean.',
        targetPrompt: 'Paste the copied sentence here:',
      },
      {
        id: 'c2-folder',
        kind: 'folder_management',
        title: 'Create Folder & Move Story',
        instruction: 'Create a new folder named "Stories" and move "Rabbit.docx" into "Stories".',
        points: 35,
        initialFolders: ['Desktop', 'Pictures'],
        initialFiles: [
          { id: 'f1', name: 'Rabbit.docx', folder: 'Desktop' },
          { id: 'f2', name: 'Tree.png', folder: 'Pictures' },
        ],
        requiredNewFolder: 'Stories',
        requiredMoveFileId: 'f1',
        requiredDestinationFolder: 'Stories',
      },
      {
        id: 'c2-format',
        kind: 'text_format_save',
        title: 'Format Heading & Save',
        instruction: 'Apply both Bold and Underline to the heading and save it as "class2_story.docx".',
        points: 30,
        sampleDocument: 'The Clever Rabbit',
        requiredFormat: 'both',
        requiredFileName: 'class2_story.docx',
      },
    ],
  },
  {
    classLevel: 3,
    tierLabel: 'Primary (Class 3)',
    targetWpm: 14,
    targetAccuracyPct: 85,
    typingDurationSec: 60,
    practicalFocus: 'Keyboard copy-paste, folder organization with file rename, and document saving.',
    typingPassage: 'Good habits help us learn faster. Always sit straight and keep your fingers gently on the home keys.',
    tasks: [
      {
        id: 'c3-copy',
        kind: 'copy_paste',
        title: 'Copy & Paste Notice Line',
        instruction: 'Copy the exact school notice line and paste it into the notice board box.',
        points: 35,
        sourceText: 'Morning assembly begins at 8:00 AM sharp.',
        targetPrompt: 'Paste the school notice here:',
      },
      {
        id: 'c3-folder',
        kind: 'folder_management',
        title: 'Organise Homework Folder',
        instruction: 'Create folder "Homework", move "Maths_Sheet.pdf" into "Homework", and rename it to "Maths_Ch3.pdf".',
        points: 35,
        initialFolders: ['Desktop', 'Downloads'],
        initialFiles: [
          { id: 'f1', name: 'Maths_Sheet.pdf', folder: 'Downloads' },
          { id: 'f2', name: 'Timetable.png', folder: 'Desktop' },
        ],
        requiredNewFolder: 'Homework',
        requiredMoveFileId: 'f1',
        requiredDestinationFolder: 'Homework',
        requiredRenameFileId: 'f1',
        requiredNewFileName: 'Maths_Ch3.pdf',
      },
      {
        id: 'c3-format',
        kind: 'text_format_save',
        title: 'Bold Heading & Save Project',
        instruction: 'Apply Bold formatting to the document heading and save as "plants_project.docx".',
        points: 30,
        sampleDocument: 'Parts of a Green Plant',
        requiredFormat: 'bold',
        requiredFileName: 'plants_project.docx',
      },
    ],
  },
  {
    classLevel: 4,
    tierLabel: 'Primary (Class 4)',
    targetWpm: 18,
    targetAccuracyPct: 87,
    typingDurationSec: 60,
    practicalFocus: 'Multi-sentence copy-paste, folder relocation, and Find & Replace text correction.',
    typingPassage: 'Water is precious for every living being on Earth. We must close taps properly and harvest rainwater at school and home.',
    tasks: [
      {
        id: 'c4-copy',
        kind: 'copy_paste',
        title: 'Copy & Paste Science Fact',
        instruction: 'Copy the complete science fact below and paste it into the submission box without typos.',
        points: 30,
        sourceText: 'Green plants make food using sunlight, water, and carbon dioxide.',
        targetPrompt: 'Paste the science fact here:',
      },
      {
        id: 'c4-folder',
        kind: 'folder_management',
        title: 'Move Science Notes to Folder',
        instruction: 'Create folder "Science" and move "Solar_System.pptx" from Downloads into "Science".',
        points: 35,
        initialFolders: ['Desktop', 'Downloads'],
        initialFiles: [
          { id: 'f1', name: 'Solar_System.pptx', folder: 'Downloads' },
          { id: 'f2', name: 'Poem_Draft.docx', folder: 'Desktop' },
        ],
        requiredNewFolder: 'Science',
        requiredMoveFileId: 'f1',
        requiredDestinationFolder: 'Science',
      },
      {
        id: 'c4-replace',
        kind: 'find_replace_list',
        title: 'Find & Replace Spelling Fix',
        instruction: 'Replace every occurrence of "skool" with "school" in the paragraph below.',
        points: 35,
        draftParagraph: 'Our skool has a clean garden. Every student keeps the skool library quiet and neat.',
        findWord: 'skool',
        replaceWord: 'school',
      },
    ],
  },
  {
    classLevel: 5,
    tierLabel: 'Upper Primary (Class 5)',
    targetWpm: 22,
    targetAccuracyPct: 88,
    typingDurationSec: 60,
    practicalFocus: 'Accurate copy-paste, folder creation & file renaming, and Find & Replace cleanup.',
    typingPassage: 'Computers follow clear step-by-step instructions called programs. Organising files into named folders saves valuable time during class projects.',
    tasks: [
      {
        id: 'c5-copy',
        kind: 'copy_paste',
        title: 'Copy & Paste Definition',
        instruction: 'Copy the exact computer science definition and paste it into the report box.',
        points: 30,
        sourceText: 'Hardware refers to physical computer parts, while software gives instructions.',
        targetPrompt: 'Paste the definition here:',
      },
      {
        id: 'c5-folder',
        kind: 'folder_management',
        title: 'Archive Project Folder',
        instruction: 'Create folder "Term1_Projects", move "Draft_Report.docx" into it, and rename the file to "Final_Report.docx".',
        points: 35,
        initialFolders: ['Desktop', 'Documents'],
        initialFiles: [
          { id: 'f1', name: 'Draft_Report.docx', folder: 'Desktop' },
          { id: 'f2', name: 'Map_India.png', folder: 'Documents' },
        ],
        requiredNewFolder: 'Term1_Projects',
        requiredMoveFileId: 'f1',
        requiredDestinationFolder: 'Term1_Projects',
        requiredRenameFileId: 'f1',
        requiredNewFileName: 'Final_Report.docx',
      },
      {
        id: 'c5-replace',
        kind: 'find_replace_list',
        title: 'Find & Replace Technical Term',
        instruction: 'Replace every occurrence of "compter" with "computer" in the draft below.',
        points: 35,
        draftParagraph: 'A compter lab needs careful handling. Always shut down the compter before leaving your chair.',
        findWord: 'compter',
        replaceWord: 'computer',
      },
    ],
  },
  {
    classLevel: 6,
    tierLabel: 'Middle School (Class 6)',
    targetWpm: 26,
    targetAccuracyPct: 90,
    typingDurationSec: 60,
    practicalFocus: 'Structured copy-paste, directory management, and Find & Replace editorial polish.',
    typingPassage: 'Digital literacy begins with touch typing, safe internet habits, and clean file management. Practice for ten minutes daily to improve both speed and accuracy.',
    tasks: [
      {
        id: 'c6-copy',
        kind: 'copy_paste',
        title: 'Copy & Paste Digital Safety Rule',
        instruction: 'Copy the exact cyber-safety rule and paste it into the student handbook box.',
        points: 30,
        sourceText: 'Never share your account password or OTP with anyone online.',
        targetPrompt: 'Paste the cyber-safety rule here:',
      },
      {
        id: 'c6-folder',
        kind: 'folder_management',
        title: 'Create & Move Assignment Folder',
        instruction: 'Create folder "Class6_IT", move "Scratch_Game.sb3" from Downloads into "Class6_IT", and rename it to "Quiz_Game.sb3".',
        points: 35,
        initialFolders: ['Desktop', 'Downloads', 'Documents'],
        initialFiles: [
          { id: 'f1', name: 'Scratch_Game.sb3', folder: 'Downloads' },
          { id: 'f2', name: 'Notes_Ch2.pdf', folder: 'Documents' },
        ],
        requiredNewFolder: 'Class6_IT',
        requiredMoveFileId: 'f1',
        requiredDestinationFolder: 'Class6_IT',
        requiredRenameFileId: 'f1',
        requiredNewFileName: 'Quiz_Game.sb3',
      },
      {
        id: 'c6-replace',
        kind: 'find_replace_list',
        title: 'Find & Replace Editorial Fix',
        instruction: 'Replace every occurrence of "internt" with "internet" in the paragraph.',
        points: 35,
        draftParagraph: 'The internt connects libraries worldwide. Use the internt safely with teacher guidance.',
        findWord: 'internt',
        replaceWord: 'internet',
      },
    ],
  },
  {
    classLevel: 7,
    tierLabel: 'Middle School (Class 7)',
    targetWpm: 30,
    targetAccuracyPct: 91,
    typingDurationSec: 60,
    practicalFocus: 'Precision copy-paste, directory structuring, and live Spreadsheet =SUM() formula.',
    typingPassage: 'Spreadsheets calculate totals, averages, and percentages in milliseconds. Using formulas instead of manual addition prevents errors when data values change.',
    tasks: [
      {
        id: 'c7-copy',
        kind: 'copy_paste',
        title: 'Copy & Paste Citation',
        instruction: 'Copy the exact reference citation and paste it into the bibliography box.',
        points: 30,
        sourceText: 'NCERT Class 7 Science, Chapter 4: Heat and Temperature, p. 42.',
        targetPrompt: 'Paste the exact citation here:',
      },
      {
        id: 'c7-folder',
        kind: 'folder_management',
        title: 'Move Lab Sheet to Archive',
        instruction: 'Create folder "Lab_Submissions" and move "Marks_Table.xlsx" from Desktop into "Lab_Submissions".',
        points: 35,
        initialFolders: ['Desktop', 'Documents'],
        initialFiles: [
          { id: 'f1', name: 'Marks_Table.xlsx', folder: 'Desktop' },
          { id: 'f2', name: 'Essay.docx', folder: 'Documents' },
        ],
        requiredNewFolder: 'Lab_Submissions',
        requiredMoveFileId: 'f1',
        requiredDestinationFolder: 'Lab_Submissions',
      },
      {
        id: 'c7-sheet',
        kind: 'spreadsheet_formula',
        title: 'Spreadsheet =SUM() Formula',
        instruction: 'Write a spreadsheet formula to compute the total marks across B1:B4 (e.g., =SUM(B1:B4)).',
        points: 35,
        sheetHeaders: ['Subject', 'Marks (Col B)'],
        sheetRows: [
          { label: 'B1 · Maths', values: [84] },
          { label: 'B2 · Science', values: [90] },
          { label: 'B3 · English', values: [78] },
          { label: 'B4 · Computer', values: [92] },
        ],
        formulaPrompt: 'Enter formula for Total Marks (expected 344):',
        expectedNumericResult: 344,
        requiredFormulaKeyword: 'SUM',
      },
    ],
  },
  {
    classLevel: 8,
    tierLabel: 'Middle School (Class 8)',
    targetWpm: 34,
    targetAccuracyPct: 92,
    typingDurationSec: 60,
    practicalFocus: 'Clipboard accuracy, structured folder renaming, and Spreadsheet =AVERAGE() formula.',
    typingPassage: 'Effective workplace communication relies on clear structure, crisp grammar, and reliable file naming conventions such as 2026_Science_Report_Final.pdf.',
    tasks: [
      {
        id: 'c8-copy',
        kind: 'copy_paste',
        title: 'Copy & Paste Formal Subject Line',
        instruction: 'Copy the formal email subject line verbatim and paste it into the subject box.',
        points: 30,
        sourceText: 'Submission: Class 8 Robotics Prototype & Testing Log (Batch B)',
        targetPrompt: 'Paste the exact email subject line:',
      },
      {
        id: 'c8-folder',
        kind: 'folder_management',
        title: 'Organise Robotics Assets',
        instruction: 'Create folder "Robotics_2026", move "sensor_log.csv" into it, and rename it to "batchB_sensors.csv".',
        points: 35,
        initialFolders: ['Desktop', 'Downloads'],
        initialFiles: [
          { id: 'f1', name: 'sensor_log.csv', folder: 'Downloads' },
          { id: 'f2', name: 'blueprint.pdf', folder: 'Desktop' },
        ],
        requiredNewFolder: 'Robotics_2026',
        requiredMoveFileId: 'f1',
        requiredDestinationFolder: 'Robotics_2026',
        requiredRenameFileId: 'f1',
        requiredNewFileName: 'batchB_sensors.csv',
      },
      {
        id: 'c8-sheet',
        kind: 'spreadsheet_formula',
        title: 'Spreadsheet =AVERAGE() Formula',
        instruction: 'Write a spreadsheet formula to calculate the average score across B1:B4 (e.g., =AVERAGE(B1:B4)).',
        points: 35,
        sheetHeaders: ['Unit Test', 'Score (Col B)'],
        sheetRows: [
          { label: 'B1 · Test 1', values: [76] },
          { label: 'B2 · Test 2', values: [84] },
          { label: 'B3 · Test 3', values: [88] },
          { label: 'B4 · Test 4', values: [92] },
        ],
        formulaPrompt: 'Enter formula for Average Score (expected 85):',
        expectedNumericResult: 85,
        requiredFormulaKeyword: 'AVERAGE',
      },
    ],
  },
  {
    classLevel: 9,
    tierLabel: 'Secondary (Class 9)',
    targetWpm: 38,
    targetAccuracyPct: 93,
    typingDurationSec: 60,
    practicalFocus: 'Technical copy-paste, project directory structuring, and Spreadsheet =MAX() analysis.',
    typingPassage: 'Data analysis turns raw classroom observations into actionable insights. Clean directory trees, accurate keyboard shortcuts, and formula-driven tables build real digital fluency.',
    tasks: [
      {
        id: 'c9-copy',
        kind: 'copy_paste',
        title: 'Copy & Paste CSV Header Schema',
        instruction: 'Copy the exact CSV header row (with commas, no extra spaces) and paste it into the schema field.',
        points: 30,
        sourceText: 'student_id,full_name,class_section,attendance_pct,practical_score',
        targetPrompt: 'Paste the CSV header schema:',
      },
      {
        id: 'c9-folder',
        kind: 'folder_management',
        title: 'Structure Dataset Repository',
        instruction: 'Create folder "Datasets_Clean", move "raw_attendance.csv" from Downloads into "Datasets_Clean", and rename it to "attendance_nov.csv".',
        points: 35,
        initialFolders: ['Desktop', 'Downloads', 'Reports'],
        initialFiles: [
          { id: 'f1', name: 'raw_attendance.csv', folder: 'Downloads' },
          { id: 'f2', name: 'summary.pdf', folder: 'Reports' },
        ],
        requiredNewFolder: 'Datasets_Clean',
        requiredMoveFileId: 'f1',
        requiredDestinationFolder: 'Datasets_Clean',
        requiredRenameFileId: 'f1',
        requiredNewFileName: 'attendance_nov.csv',
      },
      {
        id: 'c9-sheet',
        kind: 'spreadsheet_formula',
        title: 'Spreadsheet =MAX() Peak Detection',
        instruction: 'Write a spreadsheet formula to find the highest score in B1:B5 (e.g., =MAX(B1:B5)).',
        points: 35,
        sheetHeaders: ['Student', 'Lab Score (Col B)'],
        sheetRows: [
          { label: 'B1 · Aarav', values: [81] },
          { label: 'B2 · Diya', values: [94] },
          { label: 'B3 · Kabir', values: [87] },
          { label: 'B4 · Meera', values: [91] },
          { label: 'B5 · Rohan', values: [79] },
        ],
        formulaPrompt: 'Enter formula for Peak Score (expected 94):',
        expectedNumericResult: 94,
        requiredFormulaKeyword: 'MAX',
      },
    ],
  },
  {
    classLevel: 10,
    tierLabel: 'Secondary Board (Class 10)',
    targetWpm: 42,
    targetAccuracyPct: 94,
    typingDurationSec: 60,
    practicalFocus: 'Board-level speed typing, archive folder migration, and conditional =COUNTIF() formula.',
    typingPassage: 'Preparing for Class 10 IT practicals demands fast touch typing above 40 WPM, disciplined folder versioning, and bug-free spreadsheet functions for instant reporting.',
    tasks: [
      {
        id: 'c10-copy',
        kind: 'copy_paste',
        title: 'Copy & Paste SQL Query Snippet',
        instruction: 'Copy the exact SQL SELECT query and paste it into the execution editor.',
        points: 30,
        sourceText: 'SELECT name, marks FROM students WHERE marks >= 85 ORDER BY marks DESC;',
        targetPrompt: 'Paste the exact SQL query:',
      },
      {
        id: 'c10-folder',
        kind: 'folder_management',
        title: 'Board Practical Archive',
        instruction: 'Create folder "CBSE_Practical_2026", move "database_backup.sql" into it, and rename to "roll104_db.sql".',
        points: 35,
        initialFolders: ['Desktop', 'Downloads', 'Temp'],
        initialFiles: [
          { id: 'f1', name: 'database_backup.sql', folder: 'Temp' },
          { id: 'f2', name: 'admit_card.pdf', folder: 'Desktop' },
        ],
        requiredNewFolder: 'CBSE_Practical_2026',
        requiredMoveFileId: 'f1',
        requiredDestinationFolder: 'CBSE_Practical_2026',
        requiredRenameFileId: 'f1',
        requiredNewFileName: 'roll104_db.sql',
      },
      {
        id: 'c10-sheet',
        kind: 'spreadsheet_formula',
        title: 'Spreadsheet =COUNTIF() Distinction Count',
        instruction: 'Write a formula counting how many scores in B1:B5 are >= 85 (e.g., =COUNTIF(B1:B5, ">=85")).',
        points: 35,
        sheetHeaders: ['Candidate', 'IT Score (Col B)'],
        sheetRows: [
          { label: 'B1 · Ananya', values: [88] },
          { label: 'B2 · Dev', values: [74] },
          { label: 'B3 · Ishaan', values: [92] },
          { label: 'B4 · Priya', values: [85] },
          { label: 'B5 · Tarun', values: [79] },
        ],
        formulaPrompt: 'Enter formula counting scores >= 85 (expected 3):',
        expectedNumericResult: 3,
        requiredFormulaKeyword: 'COUNTIF',
      },
    ],
  },
  {
    classLevel: 11,
    tierLabel: 'Senior Secondary (Class 11)',
    targetWpm: 46,
    targetAccuracyPct: 95,
    typingDurationSec: 60,
    practicalFocus: 'High-speed technical typing, JSON snippet copy-paste, directory structuring, and =AVERAGE() analytics.',
    typingPassage: 'Modern software engineering combines clean version control, structured JSON payloads, automated unit verification, and rapid keyboard navigation without mouse friction.',
    tasks: [
      {
        id: 'c11-copy',
        kind: 'copy_paste',
        title: 'Copy & Paste Valid JSON Config',
        instruction: 'Copy the exact JSON object without breaking quotes or braces and paste it into the config editor.',
        points: 30,
        sourceText: '{"module":"computer_skills","classLevel":11,"targetWpm":46,"strict":true}',
        targetPrompt: 'Paste the exact JSON object:',
      },
      {
        id: 'c11-folder',
        kind: 'folder_management',
        title: 'Reorganise Python Project Module',
        instruction: 'Create folder "src_utils", move "parser_draft.py" from Downloads into "src_utils", and rename it to "csv_parser.py".',
        points: 35,
        initialFolders: ['Root', 'Downloads', 'Tests'],
        initialFiles: [
          { id: 'f1', name: 'parser_draft.py', folder: 'Downloads' },
          { id: 'f2', name: 'test_parser.py', folder: 'Tests' },
        ],
        requiredNewFolder: 'src_utils',
        requiredMoveFileId: 'f1',
        requiredDestinationFolder: 'src_utils',
        requiredRenameFileId: 'f1',
        requiredNewFileName: 'csv_parser.py',
      },
      {
        id: 'c11-sheet',
        kind: 'spreadsheet_formula',
        title: 'Spreadsheet =AVERAGE() Latency Benchmark',
        instruction: 'Enter a formula to compute the mean response time in ms across B1:B5 (e.g., =AVERAGE(B1:B5)).',
        points: 35,
        sheetHeaders: ['Endpoint', 'Latency ms (Col B)'],
        sheetRows: [
          { label: 'B1 · /auth', values: [42] },
          { label: 'B2 · /workspace', values: [68] },
          { label: 'B3 · /thinking', values: [54] },
          { label: 'B4 · /reports', values: [76] },
          { label: 'B5 · /health', values: [10] },
        ],
        formulaPrompt: 'Enter formula for Mean Latency (expected 50):',
        expectedNumericResult: 50,
        requiredFormulaKeyword: 'AVERAGE',
      },
    ],
  },
  {
    classLevel: 12,
    tierLabel: 'Senior Executive (Class 12)',
    targetWpm: 50,
    targetAccuracyPct: 96,
    typingDurationSec: 60,
    practicalFocus: 'Executive 50+ WPM benchmark, precision API payload copy-paste, release folder migration, and =SUM() KPI audit.',
    typingPassage: 'Graduating students entering universities and officer academies require 50 WPM precision typing, zero-error file governance, and rapid spreadsheet auditing under time constraints.',
    tasks: [
      {
        id: 'c12-copy',
        kind: 'copy_paste',
        title: 'Copy & Paste Production Command',
        instruction: 'Copy the exact deployment verification command verbatim and paste it into the terminal box.',
        points: 30,
        sourceText: 'npm run lint && npm run build && npx tsx --test src/utils/*.test.ts',
        targetPrompt: 'Paste the exact command string:',
      },
      {
        id: 'c12-folder',
        kind: 'folder_management',
        title: 'Prepare Release Bundle Folder',
        instruction: 'Create folder "Release_v2", move "capstone_final.zip" from Staging into "Release_v2", and rename it to "class12_capstone_v2.zip".',
        points: 35,
        initialFolders: ['Workspace', 'Staging', 'Archive'],
        initialFiles: [
          { id: 'f1', name: 'capstone_final.zip', folder: 'Staging' },
          { id: 'f2', name: 'README.md', folder: 'Workspace' },
        ],
        requiredNewFolder: 'Release_v2',
        requiredMoveFileId: 'f1',
        requiredDestinationFolder: 'Release_v2',
        requiredRenameFileId: 'f1',
        requiredNewFileName: 'class12_capstone_v2.zip',
      },
      {
        id: 'c12-sheet',
        kind: 'spreadsheet_formula',
        title: 'Spreadsheet =SUM() Budget Audit',
        instruction: 'Compute the total department allocation across B1:B5 using a spreadsheet formula (e.g., =SUM(B1:B5)).',
        points: 35,
        sheetHeaders: ['Lab Head', 'Allocation ₹ (Col B)'],
        sheetRows: [
          { label: 'B1 · Workstations', values: [125000] },
          { label: 'B2 · Networking', values: [35000] },
          { label: 'B3 · Robotics Kit', values: [48000] },
          { label: 'B4 · Software Licenses', values: [22000] },
          { label: 'B5 · Backup UPS', values: [20000] },
        ],
        formulaPrompt: 'Enter formula for Total Allocation (expected 250000):',
        expectedNumericResult: 250000,
        requiredFormulaKeyword: 'SUM',
      },
    ],
  },
];

export function createDefaultComputerSkillBenchmarks(schoolId: string): ComputerSkillBenchmark[] {
  const now = new Date().toISOString().slice(0, 10);
  return CLASS_BLUEPRINTS.map((bp) => ({
    id: `cs-bench-${schoolId}-c${bp.classLevel}`,
    schoolId,
    classLevel: bp.classLevel,
    classLabel: `Class ${bp.classLevel}`,
    tierLabel: bp.tierLabel,
    targetWpm: bp.targetWpm,
    targetAccuracyPct: bp.targetAccuracyPct,
    typingDurationSec: bp.typingDurationSec,
    typingPassage: bp.typingPassage,
    practicalFocus: bp.practicalFocus,
    tasks: bp.tasks,
    updatedBy: 'Academic IT Cell',
    updatedAt: now,
  }));
}

// ============================================================================
// PURE TYPING SPEED & ACCURACY EVALUATOR
// ============================================================================

export interface TypingEvaluationResult {
  grossWpm: number;
  netWpm: number;
  accuracyPct: number;
  correctChars: number;
  errorCount: number;
  completionPct: number;
  benchmarkMet: boolean;
  typingScore: number; // 0-100
}

export function evaluateTypingPerformance(params: {
  passage: string;
  typedText: string;
  elapsedSec: number;
  targetWpm: number;
  targetAccuracyPct: number;
}): TypingEvaluationResult {
  const passage = params.passage;
  const typed = params.typedText;
  const safeSec = Math.max(5, params.elapsedSec);
  const minutes = safeSec / 60;

  let correctChars = 0;
  let errorCount = 0;
  for (let i = 0; i < typed.length; i++) {
    if (i < passage.length && typed[i] === passage[i]) {
      correctChars++;
    } else {
      errorCount++;
    }
  }

  const totalTyped = typed.length;
  const grossWpm = totalTyped > 0 ? Math.round(totalTyped / 5 / minutes) : 0;
  const netWpm = Math.max(0, Math.round((totalTyped / 5 - errorCount) / minutes));
  const accuracyPct =
    totalTyped > 0 ? Math.round((correctChars / totalTyped) * 100) : 0;
  const completionPct =
    passage.length > 0 ? Math.min(100, Math.round((totalTyped / passage.length) * 100)) : 0;

  const benchmarkMet = netWpm >= params.targetWpm && accuracyPct >= params.targetAccuracyPct;

  const wpmRatio = Math.min(1.15, netWpm / Math.max(1, params.targetWpm));
  const accRatio = Math.min(1.05, accuracyPct / Math.max(1, params.targetAccuracyPct));
  const typingScore = Math.max(
    0,
    Math.min(100, Math.round(wpmRatio * 60 + accRatio * 40)),
  );

  return {
    grossWpm,
    netWpm,
    accuracyPct,
    correctChars,
    errorCount,
    completionPct,
    benchmarkMet,
    typingScore,
  };
}

// ============================================================================
// SAFE MINI-SPREADSHEET FORMULA EVALUATOR (ZERO EVAL)
// ============================================================================

export function evaluateMiniSheetFormula(
  formulaRaw: string,
  values: number[],
): { valid: boolean; result: number | null; keyword: string | null; error?: string } {
  const trimmed = formulaRaw.trim().toUpperCase();
  if (!trimmed.startsWith('=')) {
    return { valid: false, result: null, keyword: null, error: 'Formula must start with "="' };
  }

  // Match =SUM(B1:B4), =AVERAGE(B1:B5), =MAX(B1:B5), =MIN(B1:B5), =COUNT(B1:B5)
  const rangeFn = trimmed.match(/^=(SUM|AVERAGE|AVG|MAX|MIN|COUNT)\(\s*B(\d+)\s*:\s*B(\d+)\s*\)$/);
  if (rangeFn) {
    const fn = rangeFn[1] === 'AVG' ? 'AVERAGE' : rangeFn[1];
    const start = Math.max(1, parseInt(rangeFn[2], 10));
    const end = Math.min(values.length, parseInt(rangeFn[3], 10));
    if (start > end || end < 1) {
      return { valid: false, result: null, keyword: fn, error: 'Invalid cell range' };
    }
    const slice = values.slice(start - 1, end);
    if (slice.length === 0) {
      return { valid: false, result: null, keyword: fn, error: 'Empty cell range' };
    }
    if (fn === 'SUM') return { valid: true, result: slice.reduce((a, b) => a + b, 0), keyword: 'SUM' };
    if (fn === 'AVERAGE') {
      return {
        valid: true,
        result: +(slice.reduce((a, b) => a + b, 0) / slice.length).toFixed(2),
        keyword: 'AVERAGE',
      };
    }
    if (fn === 'MAX') return { valid: true, result: Math.max(...slice), keyword: 'MAX' };
    if (fn === 'MIN') return { valid: true, result: Math.min(...slice), keyword: 'MIN' };
    if (fn === 'COUNT') return { valid: true, result: slice.length, keyword: 'COUNT' };
  }

  // Match =COUNTIF(B1:B5, ">=85")
  const countIf = trimmed.match(
    /^=COUNTIF\(\s*B(\d+)\s*:\s*B(\d+)\s*,\s*"?\s*(>=|<=|>|<|=)?\s*(\d+(?:\.\d+)?)\s*"?\s*\)$/,
  );
  if (countIf) {
    const start = Math.max(1, parseInt(countIf[1], 10));
    const end = Math.min(values.length, parseInt(countIf[2], 10));
    const op = countIf[3] || '=';
    const threshold = parseFloat(countIf[4]);
    const slice = values.slice(start - 1, end);
    const count = slice.filter((v) => {
      if (op === '>=') return v >= threshold;
      if (op === '<=') return v <= threshold;
      if (op === '>') return v > threshold;
      if (op === '<') return v < threshold;
      return v === threshold;
    }).length;
    return { valid: true, result: count, keyword: 'COUNTIF' };
  }

  return {
    valid: false,
    result: null,
    keyword: null,
    error: 'Use standard formula syntax like =SUM(B1:B4), =AVERAGE(B1:B4), =MAX(B1:B5), or =COUNTIF(B1:B5, ">=85").',
  };
}

// ============================================================================
// COMPOSITE COMPUTER SKILL GRADER
// ============================================================================

export function computeComputerSkillGrade(params: {
  typingScore: number;
  typingBenchmarkMet: boolean;
  practicalResults: ComputerSkillTaskResult[];
}): {
  practicalScore: number;
  overallScore: number;
  grade: ComputerSkillAttempt['grade'];
  benchmarkPassed: boolean;
} {
  const maxPractical = params.practicalResults.reduce((s, r) => s + r.maxScore, 0);
  const earnedPractical = params.practicalResults.reduce((s, r) => s + r.score, 0);
  const practicalScore =
    maxPractical > 0 ? Math.round((earnedPractical / maxPractical) * 100) : 0;

  const overallScore = Math.round(params.typingScore * 0.45 + practicalScore * 0.55);
  const allPracticalPassed =
    params.practicalResults.length > 0 && params.practicalResults.every((r) => r.passed);
  const benchmarkPassed = params.typingBenchmarkMet && practicalScore >= 65;

  let grade: ComputerSkillAttempt['grade'] = 'Needs Practice';
  if (overallScore >= 85 && params.typingBenchmarkMet && allPracticalPassed) {
    grade = 'Distinction';
  } else if (overallScore >= 70 && benchmarkPassed) {
    grade = 'Proficient';
  } else if (overallScore >= 50) {
    grade = 'Developing';
  }

  return { practicalScore, overallScore, grade, benchmarkPassed };
}

// ============================================================================
// GRADE 1–12 SIMULATED PRACTICAL TASK CHECKLISTS & COMPETENCY RUBRICS
// ============================================================================

export interface GradeCompetencyChecklistSpec {
  id: string;
  label: string;
  skillArea: string;
}

export function getGradeCompetencyChecklist(
  classLevel: SchoolClassNumber,
): GradeCompetencyChecklistSpec[] {
  if (classLevel <= 2) {
    return [
      {
        id: `comp-c${classLevel}-1`,
        label: 'Sit upright with both hands resting gently on the keyboard before starting.',
        skillArea: 'Ergonomics & Posture',
      },
      {
        id: `comp-c${classLevel}-2`,
        label: 'Use mouse click or cursor cleanly to select source text and answer boxes.',
        skillArea: 'Mouse & Cursor Control',
      },
      {
        id: `comp-c${classLevel}-3`,
        label: 'Place the right file inside its matching named folder without leaving duplicates.',
        skillArea: 'Basic File Organisation',
      },
      {
        id: `comp-c${classLevel}-4`,
        label: 'Double-check the saved file name and extension before submitting work.',
        skillArea: 'Safe File Saving',
      },
    ];
  }
  if (classLevel <= 5) {
    return [
      {
        id: `comp-c${classLevel}-1`,
        label: 'Keep fingers anchored near home-row keys (ASDF / JKL;) during typing.',
        skillArea: 'Touch Typing Habits',
      },
      {
        id: `comp-c${classLevel}-2`,
        label: 'Use Copy & Paste accurately without introducing extra spaces or missing punctuation.',
        skillArea: 'Clipboard Precision',
      },
      {
        id: `comp-c${classLevel}-3`,
        label: 'Create topic folders and rename draft files using clear, readable names.',
        skillArea: 'Folder Governance',
      },
      {
        id: `comp-c${classLevel}-4`,
        label: 'Proofread the edited paragraph after Find & Replace or formatting changes.',
        skillArea: 'Document Proofreading',
      },
    ];
  }
  if (classLevel <= 8) {
    return [
      {
        id: `comp-c${classLevel}-1`,
        label: 'Maintain steady touch-typing rhythm meeting the middle-school WPM & accuracy target.',
        skillArea: 'Speed & Accuracy',
      },
      {
        id: `comp-c${classLevel}-2`,
        label: 'Verify cyber-safety rules and exact verbatim transfer on clipboard exercises.',
        skillArea: 'Digital Responsibility',
      },
      {
        id: `comp-c${classLevel}-3`,
        label: 'Structure project folders and apply consistent naming conventions with file extensions.',
        skillArea: 'Directory Hygiene',
      },
      {
        id: `comp-c${classLevel}-4`,
        label: 'Validate document edits or spreadsheet formula results against source data.',
        skillArea: 'Output Verification',
      },
    ];
  }
  if (classLevel <= 10) {
    return [
      {
        id: `comp-c${classLevel}-1`,
        label: 'Sustain board-level typing speed (>=38 WPM) with minimal character error rate.',
        skillArea: 'Board Practical Readiness',
      },
      {
        id: `comp-c${classLevel}-2`,
        label: 'Preserve exact delimiters, operators, and punctuation in CSV/SQL clipboard transfers.',
        skillArea: 'Technical Precision',
      },
      {
        id: `comp-c${classLevel}-3`,
        label: 'Archive practical deliverables into versioned folders with roll-numbered filenames.',
        skillArea: 'Practical Archiving',
      },
      {
        id: `comp-c${classLevel}-4`,
        label: 'Cross-check spreadsheet functions (=MAX / =COUNTIF) against the raw cell range.',
        skillArea: 'Spreadsheet Auditing',
      },
    ];
  }
  return [
    {
      id: `comp-c${classLevel}-1`,
      label: 'Deliver senior executive typing speed (46–50+ WPM) at >=95% character accuracy.',
      skillArea: 'Executive Keyboard Fluency',
    },
    {
      id: `comp-c${classLevel}-2`,
      label: 'Transfer structured JSON configs or CLI commands verbatim without breaking syntax.',
      skillArea: 'Zero-Error Technical Transfer',
    },
    {
      id: `comp-c${classLevel}-3`,
      label: 'Enforce modular source/release folder structures and clean versioned filenames.',
      skillArea: 'Release & Repo Hygiene',
    },
    {
      id: `comp-c${classLevel}-4`,
      label: 'Audit formula-driven KPI summaries (=AVERAGE / =SUM) before signing off.',
      skillArea: 'Quantitative QA',
    },
  ];
}

export function buildTaskChecklistSpec(
  task: ComputerSkillPracticalTaskSpec,
): Array<{ id: string; label: string }> {
  if (task.kind === 'copy_paste') {
    return [
      { id: `${task.id}-s1`, label: 'Copy text from the source box (Copy button or Ctrl+C / Cmd+C)' },
      { id: `${task.id}-s2`, label: 'Paste into the target field (Paste button or Ctrl+V / Cmd+V)' },
      { id: `${task.id}-s3`, label: 'Verify 100% character-exact match with source text' },
    ];
  }
  if (task.kind === 'folder_management') {
    const steps: Array<{ id: string; label: string }> = [];
    if (task.requiredNewFolder) {
      steps.push({
        id: `${task.id}-s-folder`,
        label: `Create new folder named "${task.requiredNewFolder}"`,
      });
    }
    if (task.requiredMoveFileId && task.requiredDestinationFolder) {
      const targetFile = (task.initialFiles || []).find((f) => f.id === task.requiredMoveFileId);
      steps.push({
        id: `${task.id}-s-move`,
        label: `Move "${targetFile?.name || 'target file'}" into "${task.requiredDestinationFolder}"`,
      });
    }
    if (task.requiredRenameFileId && task.requiredNewFileName) {
      steps.push({
        id: `${task.id}-s-rename`,
        label: `Rename target file to "${task.requiredNewFileName}"`,
      });
    }
    return steps;
  }
  if (task.kind === 'text_format_save') {
    const steps: Array<{ id: string; label: string }> = [];
    if (task.requiredFormat === 'bold' || task.requiredFormat === 'both') {
      steps.push({ id: `${task.id}-s-bold`, label: 'Apply Bold style to the document title' });
    }
    if (task.requiredFormat === 'underline' || task.requiredFormat === 'both') {
      steps.push({ id: `${task.id}-s-under`, label: 'Apply Underline style to the document title' });
    }
    steps.push({
      id: `${task.id}-s-save`,
      label: `Save file with exact name "${task.requiredFileName || 'document.txt'}"`,
    });
    return steps;
  }
  if (task.kind === 'find_replace_list') {
    return [
      { id: `${task.id}-s1`, label: `Locate misspelled word "${task.findWord || ''}" in draft` },
      {
        id: `${task.id}-s2`,
        label: `Replace all occurrences with "${task.replaceWord || ''}"`,
      },
      {
        id: `${task.id}-s3`,
        label: `Confirm 0 occurrences of "${task.findWord || ''}" remain`,
      },
    ];
  }
  // spreadsheet_formula
  return [
    { id: `${task.id}-s1`, label: 'Start spreadsheet formula with "=" syntax' },
    {
      id: `${task.id}-s2`,
      label: `Use required function =${task.requiredFormulaKeyword || 'SUM'}(...)`,
    },
    {
      id: `${task.id}-s3`,
      label: `Confirm evaluated output equals ${task.expectedNumericResult ?? 0}`,
    },
  ];
}

export function computeChecklistCompletionPct(items: Array<{ completed: boolean }>): number {
  if (items.length === 0) return 0;
  const done = items.filter((i) => i.completed).length;
  return Math.round((done / items.length) * 100);
}

