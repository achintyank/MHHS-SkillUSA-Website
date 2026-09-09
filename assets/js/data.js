/* ==========================================================================
   MHHS SkillsUSA site content
   --------------------------------------------------------------------------
   This is the one file to edit when the chapter changes. Officers, committee
   representatives, competitions, calendar dates, FAQs and photos all live
   here. Nothing here is styling. Edit the text, save, refresh.

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
  const CHAPTER_EMAIL = "mhhsskillsusa@lammersvilleusd.net";

  const chapter = {
    year: "2026–2027",
    school: "Mountain House High School",
    district: "Lammersville Unified School District",
    org: "SkillsUSA",
    orgLong: "SkillsUSA: Champions at Work",
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
      ["Gold", "The individual, the most important element of the organization."]
    ],

    socials: [
      { icon: "instagram", handle: "@mhhs.skillsusa", url: "https://www.instagram.com/mhhs.skillsusa/" },
      { icon: "mail",      handle: CHAPTER_EMAIL, url: "mailto:" + CHAPTER_EMAIL }
    ],

    // Paste the Google Calendar embed URL here and the calendar page fills in.
    calendarEmbed: "",

    email: CHAPTER_EMAIL,

    /* Once the season's last date has passed the countdown has nothing left to
       point at. Rather than the band disappearing over the summer it counts to
       the start of the next season instead.

       This is a PLACEHOLDER month and day that repeats every year, standing in
       until an officer sets the real one. Format MM-DD. Change this line and
       the countdown follows; there is nothing else to edit.

       1 August rather than a real first day of school, because that date moves
       every year. It is early enough to always land before the school year
       opens, so the countdown never runs past its own target. */
    nextSeason: "08-01",

    /* Every form the chapter uses. Paste the live URL and the button turns on.

       Until then the button does NOT go dead: it becomes a mailto to the
       chapter address, with `ask` as its wording and the form's label as the
       subject line. A member should never hit a dead end because a Google
       Form has not been made yet. */
    forms: {
      interest:      { label: "SkillsUSA Interest Form",            url: "",
                       ask: "Email us to get involved" },
      ctso:          { label: "School-Wide CTSO Form",
                     // Canonical /viewform link. The URL supplied ended in
                     // /closedform, which is what Google serves when a form is
                     // NOT accepting responses. /viewform works in both states
                     // and starts working again the moment it reopens.
                     url: "https://docs.google.com/forms/d/e/1FAIpQLSe2PuJz-V0pFNA_t2gUXDW0b09zJeU9uh7dBx_jXC5WYIY8lQ/viewform" },
      membership:    { label: "MHHS SkillsUSA Membership Form",
                     url: "https://docs.google.com/forms/d/e/1FAIpQLScchINJYRnMSYFffP8UjJJ0suexolmsWF_QMA9l43zVmwgxVA/viewform" },
      eventSelection:{ label: "Competition Selection Form",         url: "",
                       ask: "Email your contest choice" },
      questions:     { label: "Questions & Support Form",           url: "",
                       ask: "Email the officer team" },
      classRep:      { label: "Committee Representative Application", url: "",
                       ask: "Email to apply" },
      spotlight:     { label: "Member Spotlight Nomination",        url: "",
                       ask: "Email a nomination" }
    }
  };

  /* -------------------------------------------------------------- media
     No chapter photographs exist yet, so every image slot is filled by a
     generated plate, a designed graphic in the chapter palette, produced by
     tools/plates.py. The site looks finished today and takes real photos the
     moment they arrive.

     TO SWITCH TO REAL PHOTOGRAPHS
     1. Drop the full-size file in assets/img/gallery/<slug>.jpg
        and a smaller copy in assets/img/gallery/thumb/<slug>.jpg
     2. Add "<slug>" to the `real` list below.
     When every slot has a photograph, set ext to "jpg" and empty `real`. */
  const media = {
    ext: "svg",   // "svg" = generated plates · "jpg" = real photographs
    real: ["chapter-officer-team", "chapter-shop-floor", "competition-manager", "director-of-events-1", "director-of-events-2", "director-of-events-3", "nlsc-atlanta", "president", "secretary", "slsc-delegation", "social-media", "treasurer", "vice-president-1", "vice-president-2"],     // slugs that already have a real .jpg, whatever `ext` says

    // The three-column pinned collage on the home page.
    collage: {
      left:  ["slsc-delegation", "chapter-service-day", "slsc-medal-stage",
              "chapter-framework-workshop", "rlsc-contest-floor"],
      pin:   ["slsc-awards-crowd", "chapter-officer-team", "slsc-contest-floor"],
      right: ["chapter-first-meeting", "slsc-job-interview", "nlsc-atlanta",
              "slsc-chapter-sign", "chapter-fundraiser"]
    },

    // The 3D card track further down the home page.
    surfer: [
      "slsc-delegation", "chapter-officer-team", "slsc-medal-stage", "chapter-shop-floor",
      "slsc-awards-crowd", "chapter-contest-prep", "slsc-contest-floor", "rlsc-delegation",
      "chapter-service-day", "slsc-job-interview", "slsc-chapter-sign", "chapter-opening-ceremonies",
      "rlsc-contest-floor", "nlsc-atlanta", "chapter-framework-workshop", "chapter-fundraiser"
    ]
  };

  const ext = (slug) => (media.real.indexOf(slug) >= 0 ? "jpg" : media.ext);
  const art = {
    photo:  (slug) => "assets/img/gallery/" + slug + "." + ext(slug),
    thumb:  (slug) => "assets/img/gallery/thumb/" + slug + "." + ext(slug),
    person: (slug) => "assets/img/people/" + slug + "." + ext(slug)
  };

  /* -------------------------------------------------------------- hero
     Two photographs in one frame. The BASE is the delegation outside the
     California State Leadership and Skills Conference; the REVEAL is the
     same chapter inside the national conference in Atlanta. The cursor
     opens a window from one into the other.

     Paths are STEMS, not filenames. tools/hero_images.py builds
     <stem>-1280 and <stem>-2048 in both .webp and .jpg, and the hero picks
     the right one for the screen. Do not point these at the originals;
     those still carry EXIF GPS data and are far too heavy.

     TO CHANGE THE PHOTOGRAPHS
     1. Drop the new originals in assets/img/hero/
     2. Point SOURCES in tools/hero_images.py at them, tune the crop, run it
     3. Update the stems and the alt text below

     Both frames must end up the same size and aspect, because the shader samples
     them with one set of coordinates, so a mismatch slides one against the
     other. hero_images.py enforces this. */
  const hero = {
    base: {
      stem: "assets/img/hero/delegation",
      alt: "The MHHS SkillsUSA delegation outside the California State " +
           "Leadership and Skills Conference in Ontario."
    },
    reveal: {
      stem: "assets/img/hero/delegation-reveal",
      alt: ""                       // decorative; the base carries the alt
    },

    widths: [1280, 2048],           // must match WIDTHS in tools/hero_images.py

    // --- fluid simulation -------------------------------------------------
    // The reveal is a Navier-Stokes solve, not a shape. The cursor injects dye
    // and velocity; wherever there is dye, the second photograph shows.

    simRes: 128,          // velocity/pressure grid. 64 is cheaper, 256 finer.
    dyeRes: 320,          // dye grid. Coarser than the screen ON PURPOSE: a
                          // smaller field blurred is smoother than a fine one

    /* Tuned for a liquid BLOB that follows the cursor, not smoke.

       The four numbers that decide which of those you get are curl,
       velocityDiss, splatForce and idle. The previous settings (curl 30,
       velocityDiss 0.55, force 6000, idle 1.0) let the flow swirl, run a long
       way and billow on its own, which reads as fire. These hold it together
       around the pointer instead. The hard edge itself is a threshold in the
       composite shader, not a setting here. */
    dissipation:  1.9,    // dye decay PER SECOND. Higher = the blob closes back up sooner
    velocityDiss: 4.6,    // motion decay per second. High: the flow stops almost at once
    curl:         0,      // vorticity confinement. 0 = no swirl, 30 = smoke
    pressureIters: 24,    // Jacobi iterations. More = smoother, more incompressible

    splatRadius: 0.34,    // size of the injection at the cursor
    splatForce:  2200,    // how hard cursor movement pushes the fluid

    // Unprompted bursts so it keeps billowing with nobody touching it.
    // 0 leaves it still until the cursor moves, which is what a blob wants.
    idle: 0
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
      bio: "Holds the chapter charter and supervises all chapter operations.",
      email: ""
    },
    {
      slug: "advisor-2",
      name: "TBD",
      role: "Lead SkillsUSA Chapter Advisor",
      bio: "Holds the chapter charter and supervises all chapter operations.",
      email: ""
    }
  ];

  /* The chapter's officer roles. Ten seats: president, two vice presidents,
     secretary, treasurer, three Directors of Events, a Competition Manager
     and Social Media. */
  const officers = [
    {
      slug: "president",
      name: "Sanvi Tej",
      role: "President",
      grade: "TBD",
      years: "TBD",
      bio: "Presides over chapter meetings and represents the chapter to the school and district.",
      school: "",
      personal: ""
    },
    {
      slug: "vice-president-1",
      name: "Anjali Palsaniya",
      role: "Vice President",
      grade: "TBD",
      years: "TBD",
      bio: "Runs the committee structure and stands in for the president.",
      school: "",
      personal: ""
    },
    {
      slug: "vice-president-2",
      name: "Arman Khan",
      role: "Vice President",
      grade: "TBD",
      years: "TBD",
      bio: "Shares the vice presidency and the committee load, and stands in for the president. Two vice presidents means a committee always has someone to go to.",
      school: "",
      personal: ""
    },
    {
      slug: "secretary",
      name: "Pranav Nittala",
      role: "Secretary",
      grade: "TBD",
      years: "TBD",
      bio: "Keeps the minutes, maintains the membership roster, and handles chapter correspondence, including the paperwork that competition entries depend on.",
      school: "",
      personal: ""
    },
    {
      slug: "treasurer",
      name: "Luke Subin",
      role: "Treasurer",
      grade: "TBD",
      years: "TBD",
      bio: "Tracks dues, fundraising income and conference costs, and reports the balance at every meeting.",
      school: "",
      personal: ""
    },
    {
      slug: "director-of-events-1",
      name: "Krish Bhaliya",
      role: "Director of Events",
      grade: "TBD",
      years: "TBD",
      bio: "Plans and runs chapter events: meetings, fundraisers, service days and the banquet. Three directors share the load across the year.",
      school: "",
      personal: ""
    },
    {
      slug: "director-of-events-2",
      name: "Naman Narang",
      role: "Director of Events",
      grade: "TBD",
      years: "TBD",
      bio: "Plans and runs chapter events alongside the other directors, and owns the logistics nobody sees until they go wrong.",
      school: "",
      personal: ""
    },
    {
      slug: "director-of-events-3",
      name: "Nandan Iyer",
      role: "Director of Events",
      grade: "TBD",
      years: "TBD",
      bio: "Plans and runs chapter events alongside the other directors, and keeps the calendar honest about what is actually booked.",
      school: "",
      personal: ""
    },
    {
      slug: "competition-manager",
      name: "Sadana Gondi",
      role: "Competition Manager",
      grade: "TBD",
      years: "TBD",
      bio: "Owns the competition season end to end: contest selection, entry paperwork, deadlines, and making sure every competitor knows what their guidelines actually require.",
      school: "",
      personal: ""
    },
    {
      slug: "social-media",
      name: "Plaksha Sisodiya",
      role: "Social Media",
      grade: "TBD",
      years: "TBD",
      bio: "Runs the social media account, updates the website, manages all media and promotional content, and more.",
      school: "",
      personal: ""
    }
  ];

  const committees = [
    {
      name: "Program of Work",
      brief: "Owns the chapter's Program of Work (the written plan SkillsUSA chapters build their year around) and tracks whether each goal actually got done in time for the Chapter Excellence Program submission.",
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
      brief: "Supports competitors through the season, runs the contest fair, and keeps the chapter's traditions going: the pin design, the shirt contest, and everything that makes a conference feel like ours.",
      reps: [
        { grade: "Freshman (9th)",   name: "TBD" },
        { grade: "Sophomore (10th)", name: "TBD" },
        { grade: "Junior (11th)",    name: "TBD" }
      ]
    }
  ];

  /* --------------------------------------------------------------- story
     The scroll-through on the home page. Each beat holds the screen while
     you scroll, then hands over to the next. Four is about the limit before
     it starts to feel like being held hostage.

     `mark` is the big ghosted numeral behind the type. Keep it short. */
  const story = [
    {
      mark: "2014",
      lead: "MHHS SkillsUSA was founded.",
      body: "More than a decade of competitors out of Mountain House, in trade, " +
            "technical and skilled service occupations."
    },
    {
      mark: "20+",
      lead: "Events competed at the national stage.",
      body: "Contests the chapter has taken to the National Leadership and Skills " +
            "Conference, judged by the industries those competitors were about " +
            "to walk into."
    },
    {
      mark: "~40",
      lead: "Teams advancing to state each year.",
      body: "Through the regional conference to the California State Leadership and " +
            "Skills Conference in Ontario."
    },
    {
      mark: "~13",
      lead: "Teams advancing to nationals each year.",
      body: "State medallists earning their place at the national conference in Atlanta."
    }
  ];


  /* ------------------------------------------------------------ framework
     The SkillsUSA Framework and its 17 Essential Elements, as published by
     SkillsUSA. Every part of the program (competitions, recognition, the
     Program of Work) is built on these. Source: skillsusa.org. */
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
      brief: "The trade itself, and the maths, science and literacy underneath it.",
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

     The contests listed under each category are real SkillsUSA contests.
     Which of them MHHS actually runs depends on the California contest list
     for the year, not on any pathway requirement. Members may enter whichever
     contest they want. Confirm the year's list with the advisor. */
  const GUIDELINES = "https://www.skillsusa.org/competitions/skillsusa-championships/";

  const eventCategories = [
    {
      id: "leadership",
      kind: "open",
      name: "Leadership",
      brief: "Contests built on Framework skills that belong to no single trade: speaking, interviewing, running a meeting, documenting a project. Any member can enter one.",
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
      brief: "The technical knowledge every trade shares, rather than the skills of any one of them: shop maths, workplace safety, customer service, running a business.",
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
      kind: "open",
      name: "Skilled and Technical",
      brief: "The trade contests: welding, culinary, cyber security, cosmetology and the rest. Pick the one you want to get good at; no class or pathway is required to enter.",
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
      window: "Submitted in the spring; confirm the year's deadline with the advisor",
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

  /* ------------------------------------------------------------ calendar
     Use YYYY-MM-DD. Anything in the past greys out automatically and drops
     to the bottom of the upcoming list.

     Entries marked `provisional: true` render as "date to be confirmed".
     Add `dayTbd: true` when only the MONTH is known. The row then shows the
     month and year with no day, and drops the countdown, rather than inventing
     a precise date. Keep the `date` mid-month so it still sorts correctly.
     The two conference blocks below are NOT provisional; they are the
     published 2026-27 dates from skillsusaca.org and skillsusa.org.
     Everything the chapter itself controls is still provisional. */
  const calendar = [
    { date: "2026-08-06", title: "Season opens", note: "First day of the school year.", kind: "Season" },
    { date: "2026-09-15", span: "2026-09-16", title: "Club Fair", note: "The school-wide fair where every club recruits. Come and find the SkillsUSA table.", kind: "School event" },
    { date: "2026-09-21", title: "First chapter meeting", note: "Membership, the Framework, and what the year looks like.", kind: "Meeting", provisional: true },
    { date: "2027-02-05", title: "Regional Leadership and Skills Conference", short: "RLSC", note: "The qualifier for state. Region assignment comes from SkillsUSA California.", kind: "Conference", provisional: true },
    { date: "2027-04-08", span: "2027-04-11", title: "State Leadership and Skills Conference", short: "SLSC", note: "Ontario. Opening ceremony at Toyota Arena, contests at the Ontario Convention Center. The 60th.", kind: "Conference" },
    { date: "2027-05-04", title: "Skills Banquet", note: "Recognition, the officer handover, and the close of the chapter year. In the MHHS MPR, after school.", kind: "Chapter event" },
    { date: "2027-05-27", title: "Season closes", note: "Last day of the chapter year.", kind: "Season" },
    { date: "2027-06-21", span: "2027-06-25", title: "National Leadership and Skills Conference", short: "NLSC", note: "Atlanta, Georgia World Congress Center. For competitors who win gold at state.", kind: "Conference" }
  ];


  /* ------------------------------------------------------------ meetings
     Add a row each week. Slides and recap emails can be Google Drive links. */
  const meetings = [
    // { date: "2026-09-04", title: "Meeting 1: Welcome to SkillsUSA", slides: "", recap: "", note: "Membership, the Framework, the year ahead." }
  ];

  /* ------------------------------------------------------------ spotlight */
  const spotlights = [
    // { name: "", grade: "", event: "", quote: "", photo: "", note: "" }
  ];

  /* ------------------------------------------------------------ gallery
     Rows still marked "Reserved" are slots waiting on a photograph,
     rendered as a designed plate until a real photograph replaces it. The
     caption describes what belongs there.

     Format: ["slug", "caption", "album"]  ·  album is "chapter", "rlsc",
     "slsc" or "nlsc". The gallery filter buttons are the three conferences;
     chapter photographs are reachable under "All".

     When a real photograph arrives: drop it in as <slug>.jpg (plus a thumb),
     add the slug to media.real above, and rewrite the caption to describe
     the photograph rather than the slot. */
  const gallery = [
    ["chapter-first-meeting",       "Reserved for the first chapter meeting of the year.", "chapter"],
    ["chapter-officer-team",        "The 2026\u201327 officer team.", "chapter"],
    ["chapter-framework-workshop",  "Reserved for a Framework workshop session.", "chapter"],
    ["chapter-shop-floor",          "Reserved for members training in the shop and lab.", "chapter"],
    ["chapter-contest-prep",        "Reserved for contest preparation in the weeks before region.", "chapter"],
    ["chapter-opening-ceremonies",  "Reserved for the Opening and Closing Ceremonies team.", "chapter"],
    ["chapter-service-day",         "Reserved for a chapter community service day.", "chapter"],
    ["chapter-fundraiser",          "Reserved for a chapter fundraiser.", "chapter"],
    ["rlsc-delegation",             "Reserved for the delegation at the Regional Leadership and Skills Conference.", "rlsc"],
    ["rlsc-contest-floor",          "Reserved for the contest floor at the regional conference.", "rlsc"],
    ["slsc-delegation",             "The chapter delegation outside the State Leadership and Skills Conference in Ontario.", "slsc"],
    ["slsc-opening-session",        "Reserved for the opening session at Toyota Arena.", "slsc"],
    ["slsc-contest-floor",          "Reserved for the contest floor at the Ontario Convention Center.", "slsc"],
    ["slsc-job-interview",          "Reserved for a competitor in the Job Interview contest.", "slsc"],
    ["slsc-medal-stage",            "Reserved for a medallist on the SLSC stage.", "slsc"],
    ["slsc-awards-crowd",           "Reserved for the chapter watching the awards session.", "slsc"],
    ["slsc-chapter-sign",           "Reserved for the chapter sign carried into awards.", "slsc"],
    ["nlsc-atlanta",                "The chapter at the national conference in Atlanta, outside the Georgia Ballroom.", "nlsc"]
  ].map(function (row) {
    return { slug: row[0], caption: row[1], album: row[2] };
  });

  /* ------------------------------------------------------------ FAQ
     Answers about SkillsUSA itself are accurate. Answers about how THIS
     chapter runs are marked TBD until the officer team decides them. */
  const faqs = [
    { g: "Joining the chapter", q: "What is SkillsUSA?", a: "SkillsUSA is a national career and technical student organization for students preparing for careers in trade, technical and skilled service occupations. It was founded in 1965 as the Vocational Industrial Clubs of America and took the name SkillsUSA in 1999." },
    { g: "Joining the chapter", q: "What does SkillsUSA actually do?", a: "Three things, and they reinforce each other: it teaches employability skills through the SkillsUSA Framework, it runs the largest skills competition in the country, and it gives chapters a structure (the Program of Work) for running service and leadership projects across a school year." },
    { g: "Joining the chapter", q: "How do I join MHHS SkillsUSA?", a: "Complete the school-wide CTSO form, submit the chapter membership form, and pay dues before the deadline. Membership must be registered nationally before you are eligible to compete." },
    { g: "Joining the chapter", q: "Do I have to be in a particular class or pathway?", a: "No. Membership is open to any Mountain House student, and every contest is open to every member, so you can enter whichever one you want, trade contests included." },
    { g: "Joining the chapter", q: "What are the dues?", a: "TBD. SkillsUSA dues have a national and a state component, and chapters usually add a small local amount. The chapter will publish the exact figure before the membership deadline." },
    { g: "Joining the chapter", q: "Can I be in SkillsUSA alongside sports or another club?", a: "Yes. Most members are. The season has a small number of fixed, non-negotiable dates (the membership deadline, region, and the state conference in April) and a lot of flexibility in between." },
    { g: "Joining the chapter", q: "Can I be a member without competing?", a: "Yes. Members who do not compete take part in meetings, service projects, fundraising, the Program of Work and conference delegations. Competition is one part of the programme, not the whole of it." },

    { g: "Meetings & communication", q: "When does the chapter meet?", a: "There is no fixed weekly slot. Meetings are called as the season needs them and announced on Canvas and by email, so watch your school email rather than looking for a standing time." },
    { g: "Meetings & communication", q: "Are meetings required?", a: "Yes. If you cannot make one, email a reasonable excuse at least 24 hours beforehand. If it is approved, missing that meeting is fine." },
    { g: "Meetings & communication", q: "How are announcements shared?", a: "Through email and Canvas. This website archives the same information, but email is where deadlines arrive first." },
    { g: "Meetings & communication", q: "What is the SkillsUSA Pledge?", a: "It opens chapter meetings, and it is worth reading rather than reciting: it is a promise to prepare through study and practice, to expect reward on the basis of service, and to treat your trade as something worth honouring. The full text is on the home page." },

    { g: "Competitions", q: "How many contests are there?", a: "113 at the national conference. The California state conference runs about 120 competitive events. Which of them MHHS enters depends on the pathways offered here and on the state contest list for the year." },
    { g: "Competitions", q: "How does a competitor get to the national conference?", a: "Three conferences. Competitors qualify at the Regional Leadership and Skills Conference (RLSC), advance to the California State Leadership and Skills Conference (SLSC) each spring, and state gold medallists earn eligibility for the National Leadership and Skills Conference (NLSC) in June." },
    { g: "Competitions", q: "Where and when is the state conference?", a: "The California State Leadership and Skills Conference is held in Ontario, California, with opening and closing ceremonies at Toyota Arena and contests at the Ontario Convention Center. The 2027 conference runs 8-11 April and is the 60th SLSC." },
    { g: "Competitions", q: "Where and when is the national conference?", a: "The National Leadership and Skills Conference is held at the Georgia World Congress Center in Atlanta. The 2027 championships run 21-25 June. The conference is scheduled to stay in Atlanta through 2033." },
    { g: "Competitions", q: "What are the three contest categories?", a: "Leadership contests test Framework skills that belong to no single trade. Occupationally Related contests cover the technical knowledge every trade shares. Skilled and Technical are the trade contests themselves. All three are open to any member, so pick whichever you want." },
    { g: "Competitions", q: "Can I enter more than one contest?", a: "No. Each member competes in one contest. Contests run concurrently at a conference anyway, so a second entry would collide with your first." },
    { g: "Competitions", q: "Do I need to memorize the contest rules?", a: "Not memorize, but know them. Contest guidelines specify what you must bring, what you may not bring, how you will be scored and what will disqualify you. Competitors lose points every year on requirements they never read." },
    { g: "Competitions", q: "What do I wear to compete?", a: "SkillsUSA has an official dress code, and it is enforced at the state and national conferences. Trade contests generally require the appropriate work attire and personal protective equipment for the occupation instead. Details are emailed out before region." }
  ];

  return {
    chapter: chapter, media: media, art: art, hero: hero,
    advisors: advisors, officers: officers, committees: committees,
    story: story, framework: framework,
    eventCategories: eventCategories, guidelines: GUIDELINES,
    recognitionEvents: recognitionEvents,
    calendar: calendar, meetings: meetings, spotlights: spotlights,
    gallery: gallery, faqs: faqs
  };
})();
