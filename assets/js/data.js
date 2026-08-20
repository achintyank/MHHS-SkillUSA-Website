/* ==========================================================================
   MHHS SkillsUSA — site content
   --------------------------------------------------------------------------
   This is the one file to edit when the chapter changes. Officers, committee
   representatives, competitions, calendar dates, FAQs and photos all live
   here. Nothing here is styling — edit the text, save, refresh.

   Anything marked TBD is waiting on the officer team or the advisor. Search
   "TBD" to find every open item at once.

   Facts about SkillsUSA itself (the Framework, the competition ladder, the
   conference dates) are sourced from skillsusa.org and skillsusaca.org and
   are marked where they came from. Facts about *this chapter* are the ones
   still marked TBD.
   ========================================================================== */

window.SKILLSUSA = (function () {
  "use strict";

  /* ------------------------------------------------------------ chapter */
  const chapter = {
    year: "2026–2027",
    school: "Mountain House High School",
    district: "Lammersville Unified School District",
    org: "SkillsUSA",
    orgLong: "SkillsUSA — Champions at Work",
    motto: "Preparing for leadership in the world of work.",

    // The SkillsUSA Pledge, said at the opening of chapter meetings.
    pledge: "Upon my honor, I pledge: To prepare myself by diligent study and " +
            "ardent practice to become a worker whose services will be " +
            "recognized as honorable by my employer and fellow workers. To " +
            "base my expectations of reward upon the solid foundation of " +
            "service. To honor and respect my vocation in such a way as to " +
            "bring repute to myself. And further, to spare no effort in " +
            "upholding the ideals of SkillsUSA.",

    // Colour symbolism, from the official emblem description.
    colors: [
      ["Red and white", "The individual states and chapters."],
      ["Blue", "The common union of the states and of the chapters."],
      ["Gold", "The individual — the most important element of the organization."]
    ],

    socials: [
      { icon: "instagram", handle: "@mhhsskillsusa", url: "" },   // TBD
      { icon: "canvas",    handle: "Chapter Canvas page", url: "" }, // TBD
      { icon: "mail",      handle: "Chapter email", url: "" }        // TBD
    ],

    // Paste the Google Calendar embed URL here and the calendar page fills in.
    calendarEmbed: "",

    // Every form the chapter uses. Paste the live URL and the button turns on.
    forms: {
      interest:      { label: "SkillsUSA Interest Form",            url: "" },
      ctso:          { label: "School-Wide CTSO Form",              url: "" },
      membership:    { label: "MHHS SkillsUSA Membership Form",     url: "" },
      eventSelection:{ label: "Competition Selection Form",         url: "" },
      questions:     { label: "Questions & Support Form",           url: "" },
      classRep:      { label: "Committee Representative Application", url: "" },
      spotlight:     { label: "Member Spotlight Nomination",        url: "" }
    }
  };

  /* -------------------------------------------------------------- media
     No chapter photographs exist yet, so every image slot is filled by a
     generated plate — a designed graphic in the chapter palette, produced by
     tools/plates.py. The site looks finished today and takes real photos the
     moment they arrive.

     TO SWITCH TO REAL PHOTOGRAPHS
     1. Drop the full-size file in assets/img/gallery/<slug>.jpg
        and a smaller copy in assets/img/gallery/thumb/<slug>.jpg
     2. Add "<slug>" to the `real` list below.
     When every slot has a photograph, set ext to "jpg" and empty `real`. */
  const media = {
    ext: "svg",   // "svg" = generated plates · "jpg" = real photographs
    real: [],     // slugs that already have a real .jpg, whatever `ext` says

    // Which plate or photo fronts each competition category on the home page.
    cine: {
      "leadership":            "chapter-opening-ceremonies",
      "occupationally-related":"chapter-contest-prep",
      "skilled-technical":     "chapter-shop-floor"
    },

    // The three-column pinned collage on the home page.
    collage: {
      left:  ["slsc-delegation", "chapter-service-day", "slsc-medal-stage",
              "chapter-framework-workshop", "flc-workshop"],
      pin:   ["slsc-awards-crowd", "chapter-officer-team", "slsc-contest-floor"],
      right: ["chapter-first-meeting", "slsc-job-interview", "nlsc-atlanta",
              "slsc-chapter-sign", "chapter-fundraiser"]
    },

    // The 3D card track further down the home page.
    surfer: [
      "slsc-delegation", "chapter-officer-team", "slsc-medal-stage", "chapter-shop-floor",
      "slsc-awards-crowd", "chapter-contest-prep", "slsc-contest-floor", "flc-delegation",
      "chapter-service-day", "slsc-job-interview", "slsc-chapter-sign", "chapter-opening-ceremonies",
      "flc-workshop", "nlsc-atlanta", "chapter-framework-workshop", "chapter-fundraiser"
    ]
  };

  const ext = (slug) => (media.real.indexOf(slug) >= 0 ? "jpg" : media.ext);
  const art = {
    photo:  (slug) => "assets/img/gallery/" + slug + "." + ext(slug),
    thumb:  (slug) => "assets/img/gallery/thumb/" + slug + "." + ext(slug),
    person: (slug) => "assets/img/people/" + slug + "." + ext(slug)
  };

  /* ------------------------------------------------------------ people
     Advisors and officers are TBD until the chapter is chartered and the
     first officer team is elected. Fill in name, grade, years, bio and
     email; delete any row the chapter does not use. */
  const advisors = [
    {
      slug: "advisor-1",
      name: "TBD",
      role: "Lead SkillsUSA Chapter Advisor",
      bio: "The lead advisor holds the chapter charter, approves competition entries, signs off on service hours, and travels with the delegation to the State Leadership and Skills Conference.",
      email: ""
    },
    {
      slug: "advisor-2",
      name: "TBD",
      role: "SkillsUSA Chapter Advisor",
      bio: "The second advisor works with the officer team on meetings, the Program of Work, and the chapter's Chapter Excellence Program submission.",
      email: ""
    }
  ];

  /* A member holding a state office, if the chapter has one. Delete this
     block and the `stateOfficer` export if not. */
  const stateOfficer = {
    slug: "state-officer",
    name: "TBD",
    role: "State Officer, SkillsUSA California",
    grade: "TBD",
    years: "TBD",
    bio: "SkillsUSA California elects a state officer team each spring at the State Leadership and Skills Conference. A chapter member holding state office represents every chapter in the region, not only this one.",
    school: "",
    personal: ""
  };

  /* The seven standard SkillsUSA officer roles. Seven is also the number of
     members on an Opening and Closing Ceremonies team, which is not an
     accident — each officer has a speaking part built around one point of
     the emblem. */
  const officers = [
    {
      slug: "president",
      name: "TBD",
      role: "President",
      grade: "TBD",
      years: "TBD",
      bio: "Presides over chapter meetings, represents the chapter to the school and district, and is accountable for the Program of Work getting done rather than merely written.",
      school: "",
      personal: ""
    },
    {
      slug: "vice-president",
      name: "TBD",
      role: "Vice President",
      grade: "TBD",
      years: "TBD",
      bio: "Runs the committee structure and stands in for the president. In most chapters this is the officer who actually knows the status of every project.",
      school: "",
      personal: ""
    },
    {
      slug: "secretary",
      name: "TBD",
      role: "Secretary",
      grade: "TBD",
      years: "TBD",
      bio: "Keeps the minutes, maintains the membership roster, and handles chapter correspondence — including the paperwork that competition entries depend on.",
      school: "",
      personal: ""
    },
    {
      slug: "treasurer",
      name: "TBD",
      role: "Treasurer",
      grade: "TBD",
      years: "TBD",
      bio: "Tracks dues, fundraising income and conference costs, and reports the balance at every meeting. Conference travel is the largest line item by a wide margin.",
      school: "",
      personal: ""
    },
    {
      slug: "reporter",
      name: "TBD",
      role: "Reporter",
      grade: "TBD",
      years: "TBD",
      bio: "Publicises the chapter — this website, the chapter's social accounts, announcements, and the school newspaper. Also the officer who makes sure someone is photographing the year.",
      school: "",
      personal: ""
    },
    {
      slug: "historian",
      name: "TBD",
      role: "Historian",
      grade: "TBD",
      years: "TBD",
      bio: "Builds and keeps the chapter archive: photographs, results, artefacts and the record of what the chapter did. Much of the Chapter Excellence Program submission comes out of this work.",
      school: "",
      personal: ""
    },
    {
      slug: "parliamentarian",
      name: "TBD",
      role: "Parliamentarian",
      grade: "TBD",
      years: "TBD",
      bio: "Advises the chair on parliamentary procedure and keeps meetings running to order. Usually the chapter's strongest Chapter Business Procedure competitor.",
      school: "",
      personal: ""
    }
  ];

  /* Assistant or junior officers, if the chapter runs them. Delete the rows
     that do not apply. */
  const assistants = [
    { slug: "assistant-1", name: "TBD", role: "Assistant Officer", grade: "TBD", years: "TBD", bio: "", school: "", personal: "" },
    { slug: "assistant-2", name: "TBD", role: "Assistant Officer", grade: "TBD", years: "TBD", bio: "", school: "", personal: "" },
    { slug: "assistant-3", name: "TBD", role: "Assistant Officer", grade: "TBD", years: "TBD", bio: "", school: "", personal: "" }
  ];

  /* --------------------------------------------------- committee reps
     A representative from each grade sits on each committee, so no year
     group finds out about a deadline the day it passes. Names stay TBD
     until applications close. */
  const committees = [
    {
      name: "Program of Work",
      brief: "Owns the chapter's Program of Work — the written plan SkillsUSA chapters build their year around — and tracks whether each goal actually got done in time for the Chapter Excellence Program submission.",
      reps: [
        { grade: "Freshman (9th)",   name: "TBD" },
        { grade: "Sophomore (10th)", name: "TBD" },
        { grade: "Junior (11th)",    name: "TBD" }
      ]
    },
    {
      name: "Community Service & Fundraising",
      brief: "Plans service projects and fundraisers, and helps members log hours correctly for American Spirit, the Community Service contest and the chapter's own recognition.",
      reps: [
        { grade: "Freshman (9th)",   name: "TBD" },
        { grade: "Sophomore (10th)", name: "TBD" },
        { grade: "Junior (11th)",    name: "TBD" }
      ]
    },
    {
      name: "Competition & Chapter Spirit",
      brief: "Supports competitors through the season, runs the contest fair, and keeps the chapter's traditions going — the pin design, the shirt contest, and everything that makes a conference feel like ours.",
      reps: [
        { grade: "Freshman (9th)",   name: "TBD" },
        { grade: "Sophomore (10th)", name: "TBD" },
        { grade: "Junior (11th)",    name: "TBD" }
      ]
    }
  ];

  /* ------------------------------------------------------------ framework
     The SkillsUSA Framework and its 17 Essential Elements, as published by
     SkillsUSA. Every part of the program — competitions, recognition, the
     Program of Work — is built on these. Source: skillsusa.org. */
  const framework = [
    {
      id: "personal-skills",
      name: "Personal Skills",
      brief: "How you carry yourself, whether or not anyone is checking.",
      elements: [
        ["Integrity", "Doing the right thing in a reliable way."],
        ["Work Ethic", "Being committed to punctuality, meeting deadlines, and following established policies and procedures to get work done."],
        ["Professionalism", "Behaving in alignment with workplace standards to display a positive image."],
        ["Responsibility", "Taking ownership of one's work performance, behavior and actions."],
        ["Adaptability/Flexibility", "Embracing change and fostering creativity; being resilient."],
        ["Self-Motivation", "Exhibiting a passion for life and career."]
      ]
    },
    {
      id: "workplace-skills",
      name: "Workplace Skills",
      brief: "How you work with other people to get something finished.",
      elements: [
        ["Communication", "Conveying and receiving information clearly, in writing, in speech and in listening."],
        ["Decision Making", "Choosing a course of action from the available options and standing behind it."],
        ["Teamwork", "Contributing to a shared goal rather than an individual one."],
        ["Multicultural Sensitivity and Awareness", "Working effectively with people whose backgrounds and perspectives differ from your own."],
        ["Planning, Organizing and Management", "Setting a course of work, sequencing it, and seeing it through."],
        ["Leadership", "Influencing and supporting others toward a result."]
      ]
    },
    {
      id: "technical-skills",
      name: "Technical Skills Grounded in Academics",
      brief: "The trade itself — and the maths, science and literacy underneath it.",
      elements: [
        ["Computer and Technology Literacy", "Using the tools of a modern workplace competently."],
        ["Job-Specific Skills", "The technical skills of your own occupational area, to industry standard."],
        ["Safety and Health", "Working safely, and knowing why each rule exists."],
        ["Service Orientation", "Meeting the needs of a customer, client or patient."],
        ["Professional Development", "Continuing to build skill after the qualification is earned."]
      ]
    }
  ];

  /* ------------------------------------------------------ competitions
     SkillsUSA sorts the Championships into three categories. Source:
     skillsusa.org "Categories and Descriptions".

     The contests listed under each category are real SkillsUSA contests,
     but WHICH of them MHHS enters depends on the CTE pathways offered at
     the school and on the California contest list for the year. Confirm
     with the advisor before publishing this as the chapter's offering. */
  const GUIDELINES = "https://www.skillsusa.org/competitions/skillsusa-championships/";

  const eventCategories = [
    {
      id: "leadership",
      kind: "open",
      name: "Leadership",
      brief: "Contests built on Framework skills that belong to no single trade — speaking, interviewing, running a meeting, documenting a project. Any member may enter regardless of pathway.",
      events: [
        { name: "Action Skills", team: "Individual", summary: "A five- to seven-minute demonstration of an occupational skill, using visual aids." },
        { name: "American Spirit", team: "Individual", summary: "A notebook documenting community service, patriotism and career and technical education projects." },
        { name: "Chapter Business Procedure", team: "Team", summary: "A written exam on parliamentary procedure plus a simulated chapter business meeting." },
        { name: "Chapter Display", team: "Team", summary: "A three-dimensional display built on the annual SkillsUSA theme, presented to judges." },
        { name: "Community Action Project", team: "Team of 2", summary: "Two members develop and present a completed community service project." },
        { name: "Community Service", team: "Team", summary: "The chapter presents its best community service project by notebook and presentation." },
        { name: "Employment Application Process", team: "Individual", summary: "Job application readiness, tested through a completed application and an interview." },
        { name: "Extemporaneous Speaking", team: "Individual", summary: "A three- to five-minute speech on an assigned topic, with five minutes to prepare." },
        { name: "Job Interview", team: "Individual", summary: "A three-phase contest covering the application, the interview and the follow-up." },
        { name: "Job Skill Demonstration A", team: "Individual", summary: "Demonstrate an entry-level skill from your own training programme." },
        { name: "Job Skill Demonstration Open", team: "Individual", summary: "Demonstrate an entry-level skill from outside your training programme." },
        { name: "Occupational Health and Safety", team: "Team of 2", summary: "A scrapbook and presentation on the school's health and safety programme." },
        { name: "Opening and Closing Ceremonies", team: "Team of 7", summary: "Seven members demonstrate command of the SkillsUSA emblem and its symbolism." },
        { name: "Outstanding Chapter", team: "Team of 3", summary: "Three members present documentation of the chapter's activity across the school year." },
        { name: "Pin Design", team: "Individual", summary: "Present a state-winning pin design with artwork and an oral explanation." },
        { name: "Prepared Speech", team: "Individual", summary: "A five- to seven-minute speech on the common theme SkillsUSA sets each year." },
        { name: "Promotional Bulletin Board", team: "Team", summary: "A chapter-built display promoting SkillsUSA, with supporting documentation." },
        { name: "Quiz Bowl", team: "Team of 5", summary: "Rapid-fire questions on academics, SkillsUSA knowledge and current events." },
        { name: "T-shirt Design", team: "Individual", summary: "Present a shirt design with an explanation of its elements." }
      ]
    },
    {
      id: "occupationally-related",
      kind: "open",
      name: "Occupationally Related",
      brief: "Framework skills applied across career and technical education generally, rather than inside one programme. Open to members from any pathway.",
      events: [
        { name: "Related Technical Math", team: "Individual", summary: "Applied mathematics as it appears in technical trades." },
        { name: "Entrepreneurship", team: "Team", summary: "Build and present a business plan for a new venture." },
        { name: "Customer Service", team: "Individual", summary: "Handle service scenarios the way a workplace would expect." },
        { name: "First Aid/CPR", team: "Individual", summary: "Assessed emergency response and resuscitation skills." },
        { name: "Principles of Engineering / Technology", team: "Individual", summary: "Applied engineering and technology problem solving." },
        { name: "Career Pathways Showcase", team: "Team of up to 3", summary: "Present a project rooted in one of the national career pathways." },
        { name: "Technical Computer Applications", team: "Individual", summary: "Productivity and technical software used to a workplace standard." }
      ]
    },
    {
      id: "skilled-technical",
      kind: "eligibility",
      name: "Skilled and Technical",
      brief: "The trade contests. To enter one you must meet the eligibility requirements of the matching occupational training programme — which is why the pathways offered at MHHS decide which of these the chapter can enter.",
      events: [
        { name: "Welding", team: "Individual", summary: "Assessed welds across processes and positions, judged to industry standard." },
        { name: "Welding Fabrication", team: "Team of 3", summary: "Fabricate a project from a drawing under time and quality constraints." },
        { name: "Carpentry", team: "Individual", summary: "Frame and finish to a supplied drawing." },
        { name: "Cabinetmaking", team: "Individual", summary: "Build a cabinet project to specification." },
        { name: "Electrical Construction Wiring", team: "Individual", summary: "Install and test wiring to code." },
        { name: "Plumbing", team: "Individual", summary: "Install and test plumbing systems to code." },
        { name: "HVAC/R", team: "Individual", summary: "Diagnose and service heating, ventilation, air conditioning and refrigeration systems." },
        { name: "Automotive Service Technology", team: "Individual", summary: "Diagnostic and service stations across vehicle systems." },
        { name: "Collision Repair Technology", team: "Individual", summary: "Structural and cosmetic repair of vehicle bodies." },
        { name: "Diesel Equipment Technology", team: "Individual", summary: "Service and diagnosis of diesel engines and equipment." },
        { name: "Precision Machining Technology", team: "Individual", summary: "Machine a part to drawing on manual equipment." },
        { name: "CNC Technician", team: "Individual", summary: "Programme, set up and run CNC milling or turning." },
        { name: "Additive Manufacturing", team: "Team of 2", summary: "Design and produce a part using additive processes." },
        { name: "Robotics and Automation Technology", team: "Team of 2", summary: "Build, programme and troubleshoot an automated system." },
        { name: "Mechatronics", team: "Team of 2", summary: "Integrated mechanical, electrical and control systems work." },
        { name: "Engineering Technology/Design", team: "Team of 3", summary: "Design, prototype and present an engineering solution." },
        { name: "Technical Drafting", team: "Individual", summary: "Produce technical drawings to standard." },
        { name: "Architectural Drafting", team: "Individual", summary: "Produce architectural drawings to standard." },
        { name: "Computer Programming", team: "Individual", summary: "Solve programming problems against a specification." },
        { name: "Cyber Security", team: "Team of 2", summary: "Defend and analyse systems under contest conditions." },
        { name: "Information Technology Services", team: "Individual", summary: "Diagnose and resolve realistic IT support scenarios." },
        { name: "Internetworking", team: "Individual", summary: "Configure and troubleshoot network infrastructure." },
        { name: "Web Design and Development", team: "Team of 2", summary: "Build a website to a supplied brief." },
        { name: "3-D Visualization and Animation", team: "Team of 2", summary: "Produce an animated sequence to a brief." },
        { name: "Digital Cinema Production", team: "Team of 2", summary: "Plan, shoot and edit a short film on a given prompt." },
        { name: "Broadcast News Production", team: "Team of 2", summary: "Produce a news segment under deadline." },
        { name: "Advertising Design", team: "Individual", summary: "Design an advertising piece to a client brief." },
        { name: "Graphic Communications", team: "Individual", summary: "Prepress, press and finishing to commercial standard." },
        { name: "Photography", team: "Individual", summary: "Shoot and present to an assigned brief." },
        { name: "Criminal Justice", team: "Individual", summary: "Law enforcement knowledge and practical scenarios." },
        { name: "Crime Scene Investigation", team: "Team of 3", summary: "Process a scene, document evidence and report findings." },
        { name: "Firefighting", team: "Individual", summary: "Assessed fireground skills and knowledge." },
        { name: "Emergency Medical Technician", team: "Team of 2", summary: "Assessed patient assessment and prehospital care." },
        { name: "Culinary Arts", team: "Individual", summary: "Produce a menu to professional standard under time." },
        { name: "Commercial Baking", team: "Individual", summary: "Produce baked goods to specification and standard." },
        { name: "Restaurant Service", team: "Individual", summary: "Front-of-house service assessed to industry standard." },
        { name: "Cosmetology", team: "Individual", summary: "Assessed cutting, colouring and styling." },
        { name: "Esthetics", team: "Individual", summary: "Assessed skin care and treatment services." },
        { name: "Nail Care", team: "Individual", summary: "Assessed manicure and nail services." },
        { name: "Early Childhood Education", team: "Individual", summary: "Plan and deliver a developmentally appropriate activity." },
        { name: "Medical Assisting", team: "Individual", summary: "Clinical and administrative medical office skills." },
        { name: "Nurse Assisting", team: "Individual", summary: "Assessed patient care skills." },
        { name: "Health Knowledge Bowl", team: "Team of 4", summary: "Rapid-fire questions across the health sciences." },
        { name: "Aviation Maintenance Technology", team: "Individual", summary: "Assessed airframe and powerplant maintenance tasks." },
        { name: "Electronics Technology", team: "Individual", summary: "Diagnose and repair electronic circuits and systems." },
        { name: "Telecommunications Cabling", team: "Individual", summary: "Terminate and test structured cabling to standard." }
      ]
    }
  ];

  /* --------------------------------------------- recognition programmes
     Chapter- and member-level recognition that runs alongside competition.
     Confirm current requirements against skillsusa.org before relying on
     any threshold printed here. */
  const recognitionEvents = [
    {
      name: "Chapter Excellence Program (CEP)",
      type: "Chapter",
      summary: "The chapter's annual self-assessment against the SkillsUSA Framework. Chapters document their Program of Work across the year and submit at one of three levels; the strongest submissions are named Models of Excellence.",
      window: "Submitted in the spring — confirm the year's deadline with the advisor",
      levels: [["Level 1", "Chapter meets the baseline standard"], ["Level 2", "Chapter documents Framework integration"], ["Level 3", "Chapter demonstrates measurable results"]],
      link: "https://www.skillsusa.org/programs/chapter-excellence-program/"
    },
    {
      name: "American Spirit",
      type: "Individual",
      summary: "A notebook documenting a member's community service, patriotism and work in career and technical education. It is also a Leadership contest, so the same work can be entered for competition.",
      window: "Notebook due ahead of the state conference",
      levels: [],
      link: "https://www.skillsusa.org/competitions/skillsusa-championships/"
    },
    {
      name: "Community Service",
      type: "Chapter",
      summary: "The chapter's single best community service project of the year, presented by notebook and by presentation to judges. Hours logged by members across the year feed directly into this.",
      window: "Project documented across the season",
      levels: [],
      link: "https://www.skillsusa.org/competitions/skillsusa-championships/"
    },
    {
      name: "Career Essentials",
      type: "Individual",
      summary: "SkillsUSA's own curriculum and credential in employability skills. Members work through the assessments and earn a certification that goes on a résumé and into a job or apprenticeship application.",
      window: "Self-paced across the year",
      levels: [],
      link: "https://www.skillsusa.org/programs/career-essentials/"
    },
    {
      name: "SkillsUSA Statesman Award",
      type: "Individual",
      summary: "Awarded to members who learn the SkillsUSA creed, pledge, motto, colours and emblem, and can explain what the organization stands for. The most accessible recognition in the programme, and a natural first one.",
      window: "Any time during the membership year",
      levels: [],
      link: "https://www.skillsusa.org/"
    }
  ];

  /* Written assessments offered at the state conference. In California these
     are listed separately from the hands-on contests; the exact list changes
     year to year, so confirm against the state contest list. */
  const atcEvents = [
    "Technical Information Assessments are written examinations offered at the California state conference only.",
    "They cover the academic and technical knowledge behind a trade rather than its hands-on performance.",
    "The list of assessments offered changes year to year — confirm against the California contest list before the selection form is due."
  ];

  /* ------------------------------------------------------------ calendar
     Use YYYY-MM-DD. Anything in the past greys out automatically and drops
     to the bottom of the upcoming list.

     Entries marked `provisional: true` render as "date to be confirmed".
     The two conference blocks below are NOT provisional — they are the
     published 2026-27 dates from skillsusaca.org and skillsusa.org.
     Everything the chapter itself controls is still provisional. */
  const calendar = [
    { date: "2026-09-04", title: "First chapter meeting", note: "Membership, pathway eligibility, the Framework, and what the year looks like.", kind: "Meeting", provisional: true },
    { date: "2026-09-18", title: "Contest fair", note: "Every contest the chapter offers, explained by the members who compete in them.", kind: "Chapter event", provisional: true },
    { date: "2026-10-02", title: "Program of Work adopted", note: "The chapter's written plan for the year — goals, projects and who owns each one.", kind: "Deadline", provisional: true },
    { date: "2026-10-16", title: "Fall Leadership Conference", note: "A day of leadership development built on the SkillsUSA Framework, hosted by SkillsUSA California. Host site and date announced in the autumn.", kind: "Conference", provisional: true },
    { date: "2026-11-13", title: "National membership submitted", note: "Members must be registered nationally before they can compete. This is the deadline the whole season hangs on.", kind: "Deadline", provisional: true },
    { date: "2026-12-11", title: "Competition selection form due", note: "One form covers your contest choice and any recognition programme you are pursuing.", kind: "Deadline", provisional: true },
    { date: "2027-02-05", title: "Region competition", note: "The qualifying round for the state conference. Region assignment comes from SkillsUSA California.", kind: "Conference", provisional: true },
    { date: "2027-02-25", title: "State conference registration opens", note: "Registration for SLSC opens through SkillsUSA California.", kind: "Deadline", provisional: true },
    { date: "2027-03-12", title: "State conference registration closes", note: "Late registrations are not generally accepted.", kind: "Deadline", provisional: true },
    { date: "2027-04-08", title: "State Leadership & Skills Conference — Day 1", note: "Ontario, California. Opening ceremony at Toyota Arena; contests at the Ontario Convention Center. The 60th SLSC.", kind: "Conference" },
    { date: "2027-04-11", title: "State Leadership & Skills Conference — Day 4", note: "Closing ceremony and awards. State gold medallists earn eligibility for the national conference.", kind: "Conference" },
    { date: "2027-06-21", title: "National Leadership & Skills Conference", note: "Atlanta, Georgia — Georgia World Congress Center. June 21-25, for competitors who win gold at state.", kind: "Conference" }
  ];

  /* ------------------------------------------------------------ meetings
     Add a row each week. Slides and recap emails can be Google Drive links. */
  const meetings = [
    // { date: "2026-09-04", title: "Meeting 1 — Welcome to SkillsUSA", slides: "", recap: "", note: "Membership, pathway eligibility, the Framework, the year ahead." }
  ];

  /* ------------------------------------------------------------ spotlight */
  const spotlights = [
    // { name: "", grade: "", event: "", quote: "", photo: "", note: "" }
  ];

  /* ------------------------------------------------------------ gallery
     The chapter has no photographs yet. Each row below is a reserved slot,
     rendered as a designed plate until a real photograph replaces it — the
     caption describes what belongs there.

     Format: ["slug", "caption", "album"]  ·  album is "chapter" or "conference"

     When a real photograph arrives: drop it in as <slug>.jpg (plus a thumb),
     add the slug to media.real above, and rewrite the caption to describe
     the photograph rather than the slot. */
  const gallery = [
    ["chapter-first-meeting",       "Reserved for the first chapter meeting of the year.", "chapter"],
    ["chapter-officer-team",        "Reserved for the officer team portrait.", "chapter"],
    ["chapter-framework-workshop",  "Reserved for a Framework workshop session.", "chapter"],
    ["chapter-shop-floor",          "Reserved for members training in the shop and lab.", "chapter"],
    ["chapter-contest-prep",        "Reserved for contest preparation in the weeks before region.", "chapter"],
    ["chapter-opening-ceremonies",  "Reserved for the Opening and Closing Ceremonies team.", "chapter"],
    ["chapter-service-day",         "Reserved for a chapter community service day.", "chapter"],
    ["chapter-fundraiser",          "Reserved for a chapter fundraiser.", "chapter"],
    ["flc-delegation",              "Reserved for the delegation at the Fall Leadership Conference.", "conference"],
    ["flc-workshop",                "Reserved for a workshop at the Fall Leadership Conference.", "conference"],
    ["slsc-delegation",             "Reserved for the full delegation at the State Leadership and Skills Conference.", "conference"],
    ["slsc-opening-session",        "Reserved for the opening session at Toyota Arena.", "conference"],
    ["slsc-contest-floor",          "Reserved for the contest floor at the Ontario Convention Center.", "conference"],
    ["slsc-job-interview",          "Reserved for a competitor in the Job Interview contest.", "conference"],
    ["slsc-medal-stage",            "Reserved for a medallist on the SLSC stage.", "conference"],
    ["slsc-awards-crowd",           "Reserved for the chapter watching the awards session.", "conference"],
    ["slsc-chapter-sign",           "Reserved for the chapter sign carried into awards.", "conference"],
    ["nlsc-atlanta",                "Reserved for the national conference in Atlanta.", "conference"]
  ].map(function (row) {
    return { slug: row[0], caption: row[1], album: row[2] };
  });

  /* ------------------------------------------------------------ FAQ
     Answers about SkillsUSA itself are accurate. Answers about how THIS
     chapter runs are marked TBD until the officer team decides them. */
  const faqs = [
    { g: "Joining the chapter", q: "What is SkillsUSA?", a: "SkillsUSA is a national career and technical student organization for students preparing for careers in trade, technical and skilled service occupations. It was founded in 1965 as the Vocational Industrial Clubs of America and took the name SkillsUSA in 1999." },
    { g: "Joining the chapter", q: "What does SkillsUSA actually do?", a: "Three things, and they reinforce each other: it teaches employability skills through the SkillsUSA Framework, it runs the largest skills competition in the country, and it gives chapters a structure — the Program of Work — for running service and leadership projects across a school year." },
    { g: "Joining the chapter", q: "How do I join MHHS SkillsUSA?", a: "Complete the school-wide CTSO form, submit the chapter membership form, and pay dues before the deadline. Membership must be registered nationally before you are eligible to compete." },
    { g: "Joining the chapter", q: "Do I have to be in a particular class or pathway?", a: "TBD — the chapter is confirming which MHHS career and technical education pathways it draws from. In general, SkillsUSA membership follows enrolment in a CTE programme, and the trade contests require eligibility in the matching programme. The Leadership and Occupationally Related contests are open more broadly." },
    { g: "Joining the chapter", q: "What are the dues?", a: "TBD. SkillsUSA dues have a national and a state component, and chapters usually add a small local amount. The chapter will publish the exact figure before the membership deadline." },
    { g: "Joining the chapter", q: "Can I be in SkillsUSA alongside sports or another club?", a: "Yes. Most members are. The season has a small number of fixed, non-negotiable dates — the membership deadline, region, and the state conference in April — and a lot of flexibility in between." },
    { g: "Joining the chapter", q: "Can I be a member without competing?", a: "Yes. Members who do not compete take part in meetings, service projects, fundraising, the Program of Work and conference delegations. Competition is one part of the programme, not the whole of it." },

    { g: "Meetings & communication", q: "When does the chapter meet?", a: "TBD — day, time and room are set by the officer team and the advisor once the year's schedule is known." },
    { g: "Meetings & communication", q: "Are meetings required?", a: "TBD. Most chapters make attendance a factor in competitor selection rather than a hard requirement, on the reasoning that a member who is not at meetings is usually not prepared either." },
    { g: "Meetings & communication", q: "How are announcements shared?", a: "Through email and Canvas. This website archives the same information, but email is where deadlines arrive first." },
    { g: "Meetings & communication", q: "What is the SkillsUSA Pledge?", a: "It opens chapter meetings, and it is worth reading rather than reciting: it is a promise to prepare through study and practice, to expect reward on the basis of service, and to treat your trade as something worth honouring. The full text is on the home page." },

    { g: "Competitions", q: "How many contests are there?", a: "113 at the national conference. The California state conference runs about 120 competitive events. Which of them MHHS enters depends on the pathways offered here and on the state contest list for the year." },
    { g: "Competitions", q: "How does a competitor get to the national conference?", a: "Four rounds. Contests start at the chapter, advance to a region or district competition, then to the state conference each spring. State gold medallists earn eligibility for the national conference in June." },
    { g: "Competitions", q: "Where and when is the state conference?", a: "The California State Leadership and Skills Conference is held in Ontario, California — opening and closing ceremonies at Toyota Arena, contests at the Ontario Convention Center. The 2027 conference runs 8-11 April and is the 60th SLSC." },
    { g: "Competitions", q: "Where and when is the national conference?", a: "The National Leadership and Skills Conference is held at the Georgia World Congress Center in Atlanta. The 2027 championships run 21-25 June. The conference is scheduled to stay in Atlanta through 2033." },
    { g: "Competitions", q: "What are the three contest categories?", a: "Leadership contests test Framework skills that belong to no single trade. Occupationally Related contests apply those skills across career and technical education generally. Skilled and Technical contests are the trade contests, and they require eligibility in the matching training programme." },
    { g: "Competitions", q: "Can I enter more than one contest?", a: "TBD — this is a chapter decision, and it is usually limited by the conference schedule rather than by preference. Contests run concurrently, so two entries can simply collide." },
    { g: "Competitions", q: "Do I need to memorize the contest rules?", a: "Not memorize, but know them. Contest guidelines specify what you must bring, what you may not bring, how you will be scored and what will disqualify you. Competitors lose points every year on requirements they never read." },
    { g: "Competitions", q: "What do I wear to compete?", a: "SkillsUSA has an official dress code, and it is enforced at the state and national conferences. Trade contests generally require the appropriate work attire and personal protective equipment for the occupation instead. Details go on Canvas before region." },

    { g: "Recognition & service", q: "Are volunteer hours required?", a: "Not for membership. They matter if you are pursuing American Spirit, contributing to the chapter's Community Service entry, or building the chapter's Chapter Excellence Program submission." },
    { g: "Recognition & service", q: "What is the Chapter Excellence Program?", a: "The chapter's annual self-assessment against the Framework. The chapter documents its Program of Work across the year and submits at one of three levels. It is the main way a chapter's whole year gets recognized rather than just its individual competitors." },
    { g: "Recognition & service", q: "What is the easiest recognition to start with?", a: "The Statesman Award. Learn the creed, pledge, motto, colours and emblem, and be able to explain what SkillsUSA stands for. It costs nothing but attention and it is a real credential." },
    { g: "Recognition & service", q: "What is Career Essentials?", a: "SkillsUSA's own employability-skills curriculum and credential. You work through the assessments at your own pace and earn a certification that belongs on a résumé and in an apprenticeship application." },

    { g: "Leadership", q: "What officers does the chapter have?", a: "Seven: President, Vice President, Secretary, Treasurer, Reporter, Historian and Parliamentarian. Seven is also the size of an Opening and Closing Ceremonies team, and each officer's part in that ceremony is built around one point of the SkillsUSA emblem." },
    { g: "Leadership", q: "How do I become an officer?", a: "TBD — the chapter will publish its election process. In most chapters, applications open in the spring and selected applicants are interviewed by the outgoing officers and the advisor." },
    { g: "Leadership", q: "What is a committee representative?", a: "A member from each grade sitting on each of the chapter's three committees, so that no year group finds out about a deadline the day it passes. Applications are announced through Canvas and email." },
    { g: "Leadership", q: "What is the Program of Work?", a: "The chapter's written plan for the year: its goals, the projects that serve them, and who owns each one. It is adopted early in the autumn and it is what the Chapter Excellence Program submission is eventually built from." },
    { g: "Leadership", q: "How do I get more involved without competing?", a: "Apply for a committee seat, help run the contest fair, take on part of the Program of Work, document the year for the Historian, or work on the chapter's Community Service entry — which needs far more hands than competitors." }
  ];

  return {
    chapter: chapter, media: media, art: art,
    advisors: advisors, stateOfficer: stateOfficer, regionRep: stateOfficer,
    officers: officers, assistants: assistants, committees: committees,
    framework: framework,
    eventCategories: eventCategories, guidelines: GUIDELINES,
    recognitionEvents: recognitionEvents, atcEvents: atcEvents,
    calendar: calendar, meetings: meetings, spotlights: spotlights,
    gallery: gallery, faqs: faqs
  };
})();
