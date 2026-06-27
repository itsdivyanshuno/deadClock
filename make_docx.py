"""Generate notes/submission-doc.docx (stdlib only).
Outputs: notes/submission-doc.docx
"""
import zipfile, os

OUT = "notes/submission-doc.docx"

# ── Simple XML helpers ────────────────────────────────────────────────────────
def x(tag, attrs=None, body=""):
    if attrs is None:
        attrs = {}
    attr_str = " ".join('%s="%s"' % (k, v) for k, v in attrs.items())
    if attr_str:
        return "<%s %s>%s</%s>" % (tag, attr_str, body, tag)
    return "<%s>%s</%s>" % (tag, body, tag)

# ── Build body content as a string ───────────────────────────────────────────
B = ""

def H(text, level):
    global B
    color = ["6366F1", "4F46E5", "6366F1"][min(level-1, 2)]
    sz = ["36", "28", "24"][min(level-1, 2)]
    para_props = x("w:pPr", {},
        x("w:pStyle", {"w:val": "H%d" % level}) +
        x("w:spacing", {"w:before": "400" if level == 1 else "240", "w:after": "120"}) +
        x("w:jc", {"w:val": "left"}))
    rpr = x("w:rPr", {},
        x("w:b", {}) +
        x("w:sz", {"w:val": sz}) +
        x("w:szCs", {"w:val": sz}) +
        x("w:color", {"w:val": color}))
    run = x("w:r", {}, rpr + x("w:t", {}, text))
    B += x("w:p", {}, para_props + run)

def P(text, style="Normal", shd=None, indent=None):
    global B
    props = x("w:pStyle", {"w:val": style})
    if shd:
        props += x("w:shd", {"w:val":"clear","w:color":"auto","w:fill":shd})
    if indent:
        props += x("w:ind", {"w:left": indent, "w:hanging": indent})
    B += x("w:p", {}, x("w:pPr", {}, props) + x("w:r", {}, x("w:t", {}, text)))

def BULLET(text):
    global B
    B += x("w:p", {},
        x("w:pPr", {},
            x("w:pStyle", {"w:val": "ListBullet"}) +
            x("w:ind", {"w:left": "720", "w:hanging": "360"})) +
        x("w:r", {}, x("w:t", {}, text)))

def TABLE(header_row, col1_w, data_rows):
    global B
    rows = ""
    for idx, row in enumerate(data_rows):
        is_bold = (idx == 0)
        color = "475569" if is_bold else "334155"
        cells = ""
        for i, cell in enumerate(row):
            w = col1_w if i == 0 else "5820"
            ppr = ""
            # header shading
            if is_bold:
                ppr += x("w:shd", {"w:val":"clear","w:color":"auto","w:fill":"F1F5F9"})
            rpr = x("w:rPr", {},
                x("w:b", {}) + x("w:color", {"w:val": color}))
            tc = x("w:tc", {},
                x("w:tcPr", {}, x("w:width", {"w:w": w, "w:type": "dxa"}) + ppr) +
                x("w:p", {},
                    x("w:r", {}, rpr + x("w:t", {}, cell))))
            cells += tc
        rows += x("w:tr", {}, cells)
    B += x("w:tbl", {},
        x("w:tblPr", {},
            x("w:tblW", {"w:w": "9020", "w:type": "dxa"}) +
            x("w:tblBorders", {},
                x("w:top",{"w:val":"single","w:sz":"4","w:color":"E2E8F0"}) +
                x("w:right",{"w:val":"single","w:sz":"4","w:color":"E2E8F0"}) +
                x("w:bottom",{"w:val":"single","w:sz":"4","w:color":"E2E8F0"}) +
                x("w:left",{"w:val":"single","w:sz":"4","w:color":"E2E8F0"}) +
                x("w:insideH",{"w:val":"single","w:sz":"4","w:color":"E2E8F0"}) +
                x("w:insideV",{"w:val":"single","w:sz":"4","w:color":"E2E8F0"}))) +
        x("w:tblGrid", {},
            x("w:gridCol", {"w:w": col1_w}) +
            x("w:gridCol", {"w:w": "5820"})) +
        rows)

# ── Build content ─────────────────────────────────────────────────────────────
H("Deadline", 1)
P("The Last-Minute Life Saver", style="Subtitle")
P("Vibe2Ship Hackathon — June 2026")
P("")
H("Problem Statement Selected", 2)
P("The Last-Minute Life Saver", shd="EEF2FF", indent="360")
P(
    "Build an AI-powered productivity companion that proactively helps users plan, "
    "prioritize, and complete tasks before deadlines. The solution should act as an "
    "autonomous agent that understands context, breaks down complex goals, and helps "
    "users make better decisions under time pressure.")
H("Solution Overview", 2)
P(
    "Deadline is an AI productivity companion built with Next.js and Google Gemini "
    "that transforms how users interact with their task lists. Instead of manually "
    "creating and sorting tasks, users have a conversation with an AI assistant that "
    "actively plans, prioritizes, and monitors their workload.")
P(
    "The user describes their tasks, deadlines, and goals in plain language. "
    "The Gemini-powered agent parses this input, creates structured task records, "
    "ranks them by urgency, breaks large goals into actionable weekly plans, and "
    "proactively alerts users when deadlines are at risk.")
P(
    "All data is persisted locally using SQLite, ensuring fast, private, and "
    "offline-capable operation — no accounts, no cloud sync, no third-party storage required.")
H("How it works", 3)
steps = [
    "User opens the chat and describes what they need to accomplish",
    "The AI creates tasks with priorities, deadlines, and subtasks automatically",
    "Users can view, filter, and toggle tasks in a dedicated Tasks view",
    "Goals with milestones are tracked visually with progress indicators",
    "The AI proactively surfaces overdue items, at-risk tasks, and focus recommendations",
]
for i, s in enumerate(steps, 1):
    P("%d. %s" % (i, s), indent="360")
H("Key Features", 2)
for title, desc in [
    ("AI-Native Task Management",
     "Create, prioritize, and complete tasks through natural conversation. "
     "No forms to fill — just describe what you need."),
    ("Proactive Workload Analysis",
     "The assistant actively monitors your list and surfaces suggestions — "
     "overdue items, upcoming deadlines, and overloaded areas."),
    ("Autonomous Goal Breakdown",
     "Set a goal with a deadline and available hours per week — the AI generates "
     "a proportional weekly task plan automatically."),
    ("At-Risk Deadline Detection",
     "Tasks nearing their deadline are flagged and rescheduling suggestions are "
     "generated before they slip through the cracks."),
    ("Time-Block Scheduling",
     "Get a suggested daily schedule with time blocks allocated by priority and estimated effort."),
    ("Three-Pane Interface",
     "Chat surface, filterable task list, and goal tracker with progress bars — "
     "all in sync automatically."),
]:
    P(title)
    P(desc)
H("Technologies Used", 2)
TABLE(
    ["Technology", "Purpose"],
    "3200",
    [
        ["Next.js 16 (App Router)", "Full-stack React framework with API routes"],
        ["React 19", "Client-side UI rendering and state management"],
        ["Tailwind CSS v4", "Design system and component styling"],
        ["Google Gemini API", "AI reasoning, and function calling"],
        ["better-sqlite3", "Local SQLite database for persistence"],
        ["TypeScript 5", "Type safety across the codebase"],
        ["Node.js Runtime", "Server-side SQLite and API routes"],
    ])
H("Google Technologies Utilized", 2)
TABLE(
    ["Technology", "How it's used"],
    "3200",
    [
        ["Google AI Studio", "Source of the Gemini API key — used to generate credentials"],
        ["Gemini API (@google/genai)", "The core AI engine powering all agent reasoning"],
        ["Gemini Function Calling", "Architectural backbone — 9 tools declared as function definitions. Gemini decides when and how to call them; results drive state changes"],
        ["Gemini Model gemini-2.5-flash",
         "The specific LLM — selected for speed, multimodal capability, and native function-calling support"],
    ])
H("Function Calling Tools", 3)
P(
    "Nine tools are declared to Gemini via functionDeclarations. Gemini operates in AUTO mode — "
    "it decides which tools to invoke based on the user's message:")
for t in [
    "add_task — create tasks with deadline, priority, category, and subtasks",
    "prioritize_tasks — re-sort pending tasks by urgency and impact",
    "complete_task — mark a task as completed by ID",
    "add_goal — create long-term goals with milestone checklists",
    "suggest_schedule — generate a time-blocked daily plan for pending tasks",
    "get_reminders — surface urgent or overdue tasks within a selected timeframe",
    "suggest_proactive_actions — analyse workload and surface proactive suggestions",
    "break_down_goal — split a goal into proportional weekly tasks",
    "reschedule_at_risk_tasks — propose realistic new deadlines for at-risk tasks",
]:
    BULLET(t)
H("Architecture", 2)
P(
    "All AI logic lives server-side. The client is a thin orchestrator that "
    "delegates to a single endpoint.")
H("Key Design Decisions", 3)
for title, desc in [
    ("Server-side only mutations",
     "The client never writes to the store directly; every change flows through /api/chat."),
    ("Append-and-replace persistence",
     "saveState() clears all rows then re-inserts them in a single transaction, keeping "
     "the database a perfect snapshot of the agent's last turn."),
    ("Local-first", "No accounts, no cloud sync, no cookies. SQLite is the only backing store."),
]:
    P(title)
    P(desc)
H("Submission Links", 2)
P("GitHub Repository: https://github.com/itsdivyanshuno/vibe2ship-lastminute-lifesaver")
P("Deployed App: [Add your Vercel / Cloud Run URL here after deployment]")
B += x("w:p", {}, "")
B += x("w:p", {},
    x("w:r", {},
        x("w:t", {}, "Submitted for Vibe2Ship Hackathon — June 2026. "
                          "Built with Next.js + Google Gemini by Divyansh.")))

# ── Assemble the ZIP ──────────────────────────────────────────────────────────
DOC_XML = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n'
DOC_XML += '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">\n'
DOC_XML += "  <w:body>\n"
DOC_XML += B
DOC_XML += '    <w:sectPr><w:pgSz w:w="12240" w:h="15840" w:orient="portrait"/>'
DOC_XML += '<w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440"'
DOC_XML += ' w:header="720" w:footer="720" w:gutter="0"/></w:sectPr>\n'
DOC_XML += "  </w:body>\n</w:document>\n"

CT = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n'
CT += '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">\n'
CT += ' <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>\n'
CT += ' <Default Extension="xml" ContentType="application/xml"/>\n'
CT += ' <Override PartName="/word/document.xml"'
CT += ' ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>\n'
CT += '</Types>\n'

REL = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n'
REL += '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">\n'
REL += ' <Relationship Id="rId1" Target="word/document.xml"\n'
REL += ' Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument"/>\n'
REL += '</Relationships>\n'

WREL = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n'
WREL += '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"/>\n'

STY = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n'
STY += '<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">\n'
STY += '  <w:documentDefaults>\n'
STY += '    <w:rPrDefault><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/><w:sz w:val="22"/><w:szCs w:val="22"/></w:rPr></w:rPrDefault>\n'
STY += '    <w:pPrDefault><w:pPr><w:spacing w:after="200" w:line="276" w:lineRule="auto"/></w:pPr></w:pPrDefault>\n'
STY += '  </w:documentDefaults>\n'
STY += '  <w:style w:type="paragraph" w:styleId="Normal"><w:name w:val="Normal"/><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/><w:sz w:val="22"/></w:rPr></w:style>\n'
STY += '  <w:style w:type="paragraph" w:styleId="H1"><w:name w:val="heading 1"/><w:basedOn w:val="Normal"/><w:pPr><w:spacing w:before="360" w:after="120"/></w:pPr><w:rPr><w:b/><w:sz w:val="36"/><w:color w:val="6366F1"/></w:rPr></w:style>\n'
STY += '  <w:style w:type="paragraph" w:styleId="H2"><w:name w:val="heading 2"/><w:basedOn w:val="Normal"/><w:pPr><w:spacing w:before="240" w:after="80"/></w:pPr><w:rPr><w:b/><w:sz w:val="28"/><w:color w:val="4F46E5"/></w:rPr></w:style>\n'
STY += '  <w:style w:type="paragraph" w:styleId="H3"><w:name w:val="heading 3"/><w:basedOn w:val="Normal"/><w:pPr><w:spacing w:before="200" w:after="60"/></w:pPr><w:rPr><w:b/><w:color w:val="6366F1"/></w:rPr></w:style>\n'
STY += '  <w:style w:type="paragraph" w:styleId="Subtitle"><w:name w:val="Subtitle"/><w:basedOn w:val="Normal"/><w:rPr><w:i/><w:sz w:val="24"/></w:rPr></w:style>\n'
STY += '  <w:style w:type="paragraph" w:styleId="ListBullet"><w:name w:val="List Bullet"/><w:basedOn w:val="Normal"/><w:pPr><w:ind w:left="720" w:hanging="360"/></w:pPr></w:style>\n'
STY += '</w:styles>\n'

os.makedirs("word/_rels", exist_ok=True)
with zipfile.ZipFile(OUT, "w", zipfile.ZIP_DEFLATED) as zf:
    zf.writestr("[Content_Types].xml", CT)
    zf.writestr("_rels/.rels", REL)
    zf.writestr("word/document.xml", DOC_XML)
    zf.writestr("word/_rels/document.xml.rels", WREL)
    zf.writestr("word/styles.xml", STY)

print("Done: %d bytes -> %s" % (os.path.getsize(OUT), OUT))
print("  Upload to Google Drive -> open with Google Docs")
