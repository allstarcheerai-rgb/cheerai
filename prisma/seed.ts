import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const db = new PrismaClient();

// ── Template definitions ──────────────────────────────────────────────────────
const TEMPLATES = [
  // ── MARKETING ──────────────────────────────────────────────────────────────
  {
    title: 'Tryout Announcement',
    category: 'marketing',
    description: 'Eye-catching social media post announcing upcoming tryouts for your gym.',
    promptTemplate: `Create a compelling tryout announcement for {{gymName}}.
Tryout details:
- Season: {{season}}
- Levels: {{levels}}
- Tryout Date: {{tryoutDate}}
- Location: {{location}}
- Age groups: {{ageGroups}}
- Additional info: {{customNotes}}

Generate:
1. An engaging Instagram/Facebook caption (2-3 paragraphs with relevant emojis and hashtags)
2. A short Twitter/X version (280 characters max)
3. A parent-friendly informational blurb for the website/newsletter
4. 5 relevant hashtags for maximum reach`,
    inputSchema: JSON.stringify([
      { name: 'gymName', label: 'Gym Name', type: 'text', required: true, placeholder: 'Elite Cheer Academy' },
      { name: 'season', label: 'Season', type: 'select', required: true, options: ['Fall 2025', 'Spring 2026', 'Summer 2026', 'Fall 2026'] },
      { name: 'levels', label: 'Levels Offered', type: 'text', required: true, placeholder: 'Youth Level 1-2, Junior Level 3-4, Senior Level 5-6' },
      { name: 'tryoutDate', label: 'Tryout Date', type: 'text', required: true, placeholder: 'Saturday, August 10th, 2025' },
      { name: 'location', label: 'Location', type: 'text', required: true, placeholder: '123 Main St, Atlanta, GA' },
      { name: 'ageGroups', label: 'Age Groups', type: 'text', placeholder: 'Ages 5-18' },
      { name: 'customNotes', label: 'Additional Details', type: 'textarea', placeholder: 'Registration link, what to wear, etc.' },
    ]),
    defaultValues: JSON.stringify({ season: 'Fall 2025' }),
    tags: 'tryouts,recruiting,announcement,social media',
  },
  {
    title: 'Competition Weekend Hype Post',
    category: 'marketing',
    description: 'High-energy post to pump up athletes and fans before a competition.',
    promptTemplate: `Create a hype competition post for {{gymName}} competing at {{competitionName}}.
Details:
- Competition: {{competitionName}}
- Date: {{compDate}}
- Location: {{compLocation}}
- Teams competing: {{teams}}
- Brand vibe: {{brandVibe}}
- Special notes: {{customNotes}}

Generate:
1. A pre-competition hype Instagram post with energy and urgency
2. A morning-of competition day post for stories/feed
3. A post-competition celebration post (wins OR gracious regardless of outcome)
4. Competition day countdown caption
Include emojis, cheer-culture language, and relevant hashtags for each.`,
    inputSchema: JSON.stringify([
      { name: 'gymName', label: 'Gym Name', type: 'text', required: true, placeholder: 'Elite Cheer Academy' },
      { name: 'competitionName', label: 'Competition Name', type: 'text', required: true, placeholder: 'NCA All-Star Nationals' },
      { name: 'compDate', label: 'Competition Date', type: 'text', required: true, placeholder: 'February 15-16, 2026' },
      { name: 'compLocation', label: 'Location', type: 'text', placeholder: 'Dallas Convention Center' },
      { name: 'teams', label: 'Teams Competing', type: 'text', placeholder: 'Senior Elite, Junior Royals, Youth Stars' },
      { name: 'brandVibe', label: 'Brand Vibe', type: 'select', options: ['Hype & Bold', 'Elegant & Classic', 'Sparkly & Fun', 'Clean & Modern'] },
      { name: 'customNotes', label: 'Custom Notes', type: 'textarea' },
    ]),
    defaultValues: JSON.stringify({ brandVibe: 'Hype & Bold' }),
    tags: 'competition,hype,social media,game day',
  },
  {
    title: 'Sponsor Request Email',
    category: 'outreach',
    description: 'Professional sponsorship request email for local businesses.',
    promptTemplate: `Write a professional sponsor request email for {{gymName}}.
Sponsorship details:
- Gym: {{gymName}}
- Business being approached: {{businessName}}
- Business type: {{businessType}}
- Sponsorship amount/level: {{sponsorshipLevel}}
- What sponsor receives: {{sponsorBenefits}}
- Season/event being sponsored: {{season}}
- Our gym's reach/stats: {{gymStats}}
- Contact name: {{contactName}}

Generate a professional, warm sponsorship request email that:
1. Personalizes the ask to the business type
2. Clearly explains the value proposition for the sponsor
3. Lists specific benefits (jersey logos, social media posts, event signage, etc.)
4. Is friendly but professional
5. Has a clear call-to-action
6. Ends with a follow-up plan`,
    inputSchema: JSON.stringify([
      { name: 'gymName', label: 'Your Gym Name', type: 'text', required: true },
      { name: 'businessName', label: 'Business Name', type: 'text', required: true, placeholder: 'Smith Family Chiropractic' },
      { name: 'businessType', label: 'Business Type', type: 'text', placeholder: 'Local restaurant, retail store, healthcare, etc.' },
      { name: 'sponsorshipLevel', label: 'Sponsorship Level/Amount', type: 'text', placeholder: 'Gold Sponsor - $500' },
      { name: 'sponsorBenefits', label: 'What Sponsor Receives', type: 'textarea', placeholder: 'Logo on jerseys, 5 social posts/month, banner at events...' },
      { name: 'season', label: 'Season/Event', type: 'text', placeholder: '2025-2026 Competition Season' },
      { name: 'gymStats', label: 'Gym Reach/Stats', type: 'textarea', placeholder: '150 athletes, 3000 Instagram followers, 8 competitions/year...' },
      { name: 'contactName', label: 'Contact Person Name', type: 'text', placeholder: 'Coach Sarah' },
    ]),
    tags: 'sponsorship,email,fundraising,business',
  },
  {
    title: 'Fundraising Post',
    category: 'marketing',
    description: 'Compelling fundraising campaign post for gym families and supporters.',
    promptTemplate: `Create a fundraising campaign for {{gymName}}.
Fundraiser details:
- Gym: {{gymName}}
- Fundraiser type: {{fundraiserType}}
- Goal amount: {{goalAmount}}
- Deadline: {{deadline}}
- What funds will be used for: {{purpose}}
- How to participate: {{howToParticipate}}
- Team doing the fundraiser: {{team}}

Generate:
1. Kick-off announcement post for social media
2. Mid-campaign update post to keep momentum
3. Final push post for the last 48 hours
4. Parent email explaining the fundraiser details
5. Thank-you post template for after the fundraiser
Include storytelling elements and emotional connection to the cause.`,
    inputSchema: JSON.stringify([
      { name: 'gymName', label: 'Gym Name', type: 'text', required: true },
      { name: 'fundraiserType', label: 'Fundraiser Type', type: 'select', required: true, options: ['Car Wash', 'Bake Sale', 'Online Campaign', 'Restaurant Night', 'Merchandise Sale', 'Donation Drive', 'Other'] },
      { name: 'goalAmount', label: 'Goal Amount', type: 'text', placeholder: '$2,000' },
      { name: 'deadline', label: 'Deadline', type: 'text', placeholder: 'March 15, 2026' },
      { name: 'purpose', label: 'Purpose', type: 'textarea', placeholder: 'Competition fees, new uniforms, gym equipment...' },
      { name: 'howToParticipate', label: 'How to Participate', type: 'textarea', placeholder: 'Link to donate, where to show up, etc.' },
      { name: 'team', label: 'Team Name', type: 'text', placeholder: 'Senior Elite Squad' },
    ]),
    tags: 'fundraising,social media,community,finance',
  },
  {
    title: 'Competition Recap Caption',
    category: 'marketing',
    description: 'Recap post after a competition highlighting results and team pride.',
    promptTemplate: `Write a competition recap post for {{gymName}} after {{competitionName}}.
Results:
- Competition: {{competitionName}}
- Date: {{compDate}}
- Results: {{results}}
- Standout moments: {{highlights}}
- Shoutouts: {{shoutouts}}
- Next competition: {{nextComp}}
- Tone: {{tone}}

Generate:
1. Full Instagram/Facebook post with results announcement
2. Instagram story slides (3-5 slide scripts)
3. TikTok caption with trending hooks
4. A gracious post for if results were disappointing (separate from victory post)
Include community-building language and call to action.`,
    inputSchema: JSON.stringify([
      { name: 'gymName', label: 'Gym Name', type: 'text', required: true },
      { name: 'competitionName', label: 'Competition Name', type: 'text', required: true },
      { name: 'compDate', label: 'Competition Date', type: 'text' },
      { name: 'results', label: 'Results', type: 'textarea', required: true, placeholder: '1st place Senior Elite, 2nd place Junior Royals, qualified for Worlds...' },
      { name: 'highlights', label: 'Standout Moments', type: 'textarea', placeholder: 'Hit a zero, personal best score, debut of new stunt...' },
      { name: 'shoutouts', label: 'Shoutouts', type: 'textarea', placeholder: 'Coaches, athletes, parents who helped...' },
      { name: 'nextComp', label: 'Next Competition', type: 'text', placeholder: 'Nationals in 3 weeks!' },
      { name: 'tone', label: 'Tone', type: 'select', options: ['Celebratory Win', 'Proud Regardless of Placement', 'Building Momentum', 'Season Finale'] },
    ]),
    tags: 'competition,recap,results,social media',
  },
  {
    title: 'Senior Night Tribute',
    category: 'marketing',
    description: 'Heartfelt tribute post celebrating senior athletes.',
    promptTemplate: `Create a senior night tribute for the seniors at {{gymName}}.
Details:
- Gym: {{gymName}}
- Senior athletes: {{seniorNames}}
- Years cheered: {{yearsInfo}}
- Season highlights: {{highlights}}
- Mentorship/impact: {{impact}}
- Future plans: {{futurePlans}}
- Tone: Emotional, celebratory, grateful

Generate:
1. Emotional senior night social media post
2. Individual tribute template for each senior (customizable)
3. Parent thank-you tribute from the gym
4. Senior speech/script template for the night
5. Memory highlight caption for a throwback photo
Make it tearworthy and authentic to cheer culture.`,
    inputSchema: JSON.stringify([
      { name: 'gymName', label: 'Gym Name', type: 'text', required: true },
      { name: 'seniorNames', label: 'Senior Athletes Names', type: 'textarea', required: true, placeholder: 'Emma Johnson, Kayla Smith, Madison Brown...' },
      { name: 'yearsInfo', label: 'Years at the Gym', type: 'text', placeholder: 'Most have cheered 8-10 years at our gym' },
      { name: 'highlights', label: 'Season/Career Highlights', type: 'textarea', placeholder: 'Won nationals 2023, captains, first to hit a full...' },
      { name: 'impact', label: 'Their Impact', type: 'textarea', placeholder: 'Leaders, mentors to younger athletes, team culture setters...' },
      { name: 'futurePlans', label: 'Future Plans', type: 'textarea', placeholder: 'College, college cheer, coaching, etc.' },
    ]),
    tags: 'seniors,tribute,emotional,recognition',
  },
  {
    title: 'New Athlete Welcome Post',
    category: 'marketing',
    description: 'Welcoming post for new athletes joining the gym family.',
    promptTemplate: `Create a new athlete welcome post for {{gymName}}.
Details:
- Gym: {{gymName}}
- New athletes: {{newAthletes}}
- Teams they joined: {{teams}}
- Season they're joining: {{season}}
- Gym's signature strengths: {{gymStrengths}}
- Welcome message tone: {{tone}}

Generate:
1. New member welcome Instagram post with warm community vibes
2. Short welcome story template
3. Welcome email from the gym director to new families
4. "Meet our newest member" spotlight template
5. First practice day caption template
Make new families feel like they made the BEST decision joining!`,
    inputSchema: JSON.stringify([
      { name: 'gymName', label: 'Gym Name', type: 'text', required: true },
      { name: 'newAthletes', label: 'New Athletes', type: 'textarea', placeholder: 'Sophia M., Jackson T., or just "20 new athletes"' },
      { name: 'teams', label: 'Teams They Joined', type: 'text', placeholder: 'Mini Level 1, Youth Level 2' },
      { name: 'season', label: 'Season', type: 'text', placeholder: 'Fall 2025 Season' },
      { name: 'gymStrengths', label: 'Gym\'s Strengths', type: 'textarea', placeholder: 'Family culture, championship coaching, skill development...' },
      { name: 'tone', label: 'Tone', type: 'select', options: ['Warm & Welcoming', 'Excited & Hype', 'Professional & Proud', 'Family & Community'] },
    ]),
    tags: 'welcome,new athletes,community,marketing',
  },
  {
    title: 'Coach Hiring Announcement',
    category: 'hr',
    description: 'Professional job posting to attract qualified cheer coaches.',
    promptTemplate: `Create a coach hiring announcement for {{gymName}}.
Position details:
- Gym: {{gymName}}
- Position: {{position}}
- Requirements: {{requirements}}
- Experience needed: {{experience}}
- Compensation: {{compensation}}
- Hours/schedule: {{schedule}}
- What makes this gym special: {{gymCulture}}
- How to apply: {{applyInfo}}

Generate:
1. Social media hiring post (Instagram/Facebook)
2. Professional job listing text for Indeed/LinkedIn
3. Short Twitter/X announcement
4. Email template to share with coaching network
Make the gym sound like an amazing place to work while being clear about requirements.`,
    inputSchema: JSON.stringify([
      { name: 'gymName', label: 'Gym Name', type: 'text', required: true },
      { name: 'position', label: 'Position Title', type: 'text', required: true, placeholder: 'Head Coach, Assistant Coach, Tumbling Instructor...' },
      { name: 'requirements', label: 'Requirements', type: 'textarea', required: true, placeholder: 'USASF credentialed, CPR certified, background check...' },
      { name: 'experience', label: 'Experience Needed', type: 'text', placeholder: '3+ years competitive cheer experience, coaching level 4+...' },
      { name: 'compensation', label: 'Compensation', type: 'text', placeholder: '$25-35/hour, salary, or "competitive pay"' },
      { name: 'schedule', label: 'Hours/Schedule', type: 'text', placeholder: 'Evenings/weekends, 15-20 hours/week' },
      { name: 'gymCulture', label: 'Gym Culture', type: 'textarea', placeholder: 'Family-oriented, championship history, growth opportunities...' },
      { name: 'applyInfo', label: 'How to Apply', type: 'text', placeholder: 'Email resume to coach@gymname.com' },
    ]),
    tags: 'hiring,coaching,jobs,staff',
  },

  // ── COACHING ───────────────────────────────────────────────────────────────
  {
    title: 'Practice Plan Block',
    category: 'coaching',
    description: 'Structured practice block focusing on a specific skill or routine element.',
    promptTemplate: `Create a focused practice block for {{gymName}} - {{teamName}}.
Practice details:
- Team: {{teamName}}
- Level: {{level}}
- Duration: {{duration}} minutes
- Focus area: {{focusArea}}
- Skill being worked: {{specificSkill}}
- Current skill level: {{currentLevel}}
- Goal for this block: {{goal}}
- Athlete count: {{athleteCount}}
- Notes: {{notes}}

Generate a detailed practice block including:
1. Warm-up specific to skill (5-10 min)
2. Skill progressions (step by step)
3. Full-skill practice with coaching cues
4. Common errors and corrections
5. Safety considerations
6. Cool-down/stretch related to skill
7. Homework for athletes to practice on their own
Format with clear time stamps and coaching language.`,
    inputSchema: JSON.stringify([
      { name: 'gymName', label: 'Gym Name', type: 'text', required: true },
      { name: 'teamName', label: 'Team Name', type: 'text', required: true },
      { name: 'level', label: 'Level', type: 'select', required: true, options: ['Level 1', 'Level 2', 'Level 3', 'Level 4', 'Level 5', 'Level 6', 'Open'] },
      { name: 'duration', label: 'Duration (minutes)', type: 'select', required: true, options: ['20', '30', '45', '60', '90'] },
      { name: 'focusArea', label: 'Focus Area', type: 'select', required: true, options: ['Tumbling', 'Stunting', 'Jumps', 'Pyramids', 'Dance', 'Full Routine', 'Conditioning'] },
      { name: 'specificSkill', label: 'Specific Skill', type: 'text', placeholder: 'Back tuck, full-up, double-down...' },
      { name: 'currentLevel', label: 'Current Athlete Level', type: 'text', placeholder: 'Most athletes have standing back tuck, need to connect' },
      { name: 'goal', label: 'Goal for This Block', type: 'text', placeholder: 'All athletes hit connected tumbling in run-through' },
      { name: 'athleteCount', label: 'Number of Athletes', type: 'text', placeholder: '20' },
      { name: 'notes', label: 'Special Notes', type: 'textarea', placeholder: 'Injured athletes, skill restrictions, upcoming comp...' },
    ]),
    tags: 'coaching,practice,skills,training',
  },
  {
    title: 'Stunt Progression Outline',
    category: 'coaching',
    description: 'Progressive stunt training plan from beginner to advanced.',
    promptTemplate: `Create a stunt progression outline for {{gymName}}.
Details:
- Level: {{level}}
- Starting point: {{startingStunt}}
- Target stunt: {{targetStunt}}
- Timeframe: {{timeframe}}
- Group composition: {{groupComp}}
- Previous experience: {{experience}}
- Training frequency: {{frequency}}

Generate:
1. Week-by-week progression plan
2. Prerequisite skills checklist before advancing
3. Drills for each phase
4. Coaching cues for bases, backspots, and flyers
5. Safety protocols and spotting guidelines
6. How to know when the group is ready to advance
7. Common problems and solutions for each phase
Make it practical and achievable within the timeframe.`,
    inputSchema: JSON.stringify([
      { name: 'gymName', label: 'Gym Name', type: 'text', required: true },
      { name: 'level', label: 'Competitive Level', type: 'select', required: true, options: ['Level 1', 'Level 2', 'Level 3', 'Level 4', 'Level 5', 'Level 6', 'Open'] },
      { name: 'startingStunt', label: 'Starting Stunt', type: 'text', required: true, placeholder: 'Elevator/prep level, shoulder stand...' },
      { name: 'targetStunt', label: 'Target Stunt', type: 'text', required: true, placeholder: 'Full-up, heel stretch, lib...' },
      { name: 'timeframe', label: 'Timeframe', type: 'select', required: true, options: ['2 weeks', '4 weeks', '6 weeks', '8 weeks', '3 months', '6 months'] },
      { name: 'groupComp', label: 'Group Composition', type: 'text', placeholder: '2 bases, 1 backspot, 1 flyer - describe their build/experience' },
      { name: 'experience', label: 'Previous Experience', type: 'textarea', placeholder: 'Have done preps for 1 year, flyer has good body position...' },
      { name: 'frequency', label: 'Training Frequency', type: 'text', placeholder: '3 practices/week, 2 hours each' },
    ]),
    tags: 'stunting,coaching,progression,skills',
  },
  {
    title: 'Conditioning Program',
    category: 'coaching',
    description: 'Cheer-specific strength and conditioning program for athletes.',
    promptTemplate: `Design a cheer-specific conditioning program for {{gymName}} - {{teamName}}.
Program details:
- Team: {{teamName}}
- Level: {{level}}
- Current fitness level: {{fitnessLevel}}
- Duration of program: {{programLength}}
- Sessions per week: {{sessionsPerWeek}}
- Session length: {{sessionLength}} minutes
- Focus: {{focus}}
- Equipment available: {{equipment}}

Generate:
1. Full weekly schedule with specific exercises
2. Warm-up routine (cheer-specific)
3. Strength exercises targeting cheer muscle groups
4. Cardio/endurance training for routine stamina
5. Flexibility and mobility work
6. Cool-down and recovery protocol
7. Progression plan over the program length
8. How to track athlete improvement
Include sets, reps, rest times, and coaching notes.`,
    inputSchema: JSON.stringify([
      { name: 'gymName', label: 'Gym Name', type: 'text', required: true },
      { name: 'teamName', label: 'Team Name', type: 'text', required: true },
      { name: 'level', label: 'Level', type: 'select', required: true, options: ['Youth', 'Junior', 'Senior', 'Open', 'All Ages'] },
      { name: 'fitnessLevel', label: 'Current Fitness Level', type: 'select', required: true, options: ['Beginner', 'Intermediate', 'Advanced'] },
      { name: 'programLength', label: 'Program Length', type: 'select', required: true, options: ['4 weeks', '6 weeks', '8 weeks', '12 weeks', 'Ongoing'] },
      { name: 'sessionsPerWeek', label: 'Sessions per Week', type: 'select', options: ['2', '3', '4', '5'] },
      { name: 'sessionLength', label: 'Session Length (minutes)', type: 'select', options: ['20', '30', '45', '60'] },
      { name: 'focus', label: 'Primary Focus', type: 'select', options: ['Overall Fitness', 'Tumbling Power', 'Stunt Strength', 'Jump Height', 'Endurance', 'Flexibility'] },
      { name: 'equipment', label: 'Equipment Available', type: 'textarea', placeholder: 'Resistance bands, mats, weights, body weight only...' },
    ]),
    tags: 'conditioning,fitness,strength,coaching',
  },
  {
    title: 'Jump Training Plan',
    category: 'coaching',
    description: 'Targeted jump improvement program for competitive levels.',
    promptTemplate: `Create a jump training plan for {{gymName}} athletes.
Details:
- Team level: {{level}}
- Current jump performance: {{currentLevel}}
- Target jumps: {{targetJumps}}
- Timeframe: {{timeframe}}
- Common issues: {{issues}}
- Practice time available: {{practiceTime}}

Generate:
1. Flexibility assessment checklist before starting
2. Daily stretch routine for jump flexibility
3. Progressive jump drills (week by week)
4. Strength exercises that support jump height
5. Technique tips for each jump type
6. Scoring criteria and what judges look for
7. Practice schedule recommendations
8. Home practice routine for athletes`,
    inputSchema: JSON.stringify([
      { name: 'gymName', label: 'Gym Name', type: 'text', required: true },
      { name: 'level', label: 'Team Level', type: 'select', required: true, options: ['Level 1', 'Level 2', 'Level 3', 'Level 4', 'Level 5', 'Level 6'] },
      { name: 'currentLevel', label: 'Current Jump Performance', type: 'textarea', required: true, placeholder: 'Athletes can hit toe touches but pikes are low, herkie is inconsistent...' },
      { name: 'targetJumps', label: 'Target Jumps', type: 'text', required: true, placeholder: 'Toe touch, pike, hurdler, right and left herkie' },
      { name: 'timeframe', label: 'Timeframe', type: 'select', options: ['2 weeks', '4 weeks', '6 weeks', '8 weeks', '3 months'] },
      { name: 'issues', label: 'Common Issues', type: 'textarea', placeholder: 'Low height, bent knees, slow arms, poor timing with cheer...' },
      { name: 'practiceTime', label: 'Practice Time Available', type: 'text', placeholder: '15 min per practice, 3x/week' },
    ]),
    tags: 'jumps,coaching,technique,flexibility',
  },

  // ── COMMUNICATION ──────────────────────────────────────────────────────────
  {
    title: 'Parent Information Email',
    category: 'communication',
    description: 'Clear and professional parent communication for important gym updates.',
    promptTemplate: `Write a parent information email for {{gymName}}.
Email details:
- Gym: {{gymName}}
- Subject matter: {{subject}}
- Key information: {{keyInfo}}
- Action required from parents: {{actionRequired}}
- Deadline: {{deadline}}
- Contact for questions: {{contact}}
- Tone: Professional but warm

Generate:
1. Full email with subject line
2. Short text/SMS version for quick announcements
3. FAQ section anticipating parent questions
4. Follow-up reminder email (1 week before deadline)
Make sure it covers all the information parents need and is clear about next steps.`,
    inputSchema: JSON.stringify([
      { name: 'gymName', label: 'Gym Name', type: 'text', required: true },
      { name: 'subject', label: 'Subject Matter', type: 'text', required: true, placeholder: 'Competition schedule, payment reminder, uniform info...' },
      { name: 'keyInfo', label: 'Key Information', type: 'textarea', required: true, placeholder: 'All the important details parents need to know...' },
      { name: 'actionRequired', label: 'Action Required', type: 'textarea', placeholder: 'Sign waiver, submit payment, RSVP by...' },
      { name: 'deadline', label: 'Deadline', type: 'text', placeholder: 'October 15th, 2025' },
      { name: 'contact', label: 'Contact for Questions', type: 'text', placeholder: 'coach@gymname.com or 555-1234' },
    ]),
    tags: 'parents,email,communication,announcements',
  },
  {
    title: 'Monthly Gym Newsletter',
    category: 'communication',
    description: 'Comprehensive monthly newsletter keeping gym families informed and engaged.',
    promptTemplate: `Create a monthly newsletter for {{gymName}}.
Newsletter details:
- Month: {{month}}
- Team highlights: {{highlights}}
- Upcoming events: {{upcomingEvents}}
- Skills spotlight: {{skillsSpotlight}}
- Athlete spotlight: {{athleteSpotlight}}
- Important reminders: {{reminders}}
- Gym news: {{gymNews}}

Generate a complete monthly newsletter including:
1. Engaging header/intro from the director
2. Month-in-review highlights section
3. Upcoming events and dates calendar
4. Skills and achievement spotlight
5. Athlete of the month feature
6. Important reminders and deadlines
7. Community and social media highlights
8. Closing inspirational message
Format as a professional email newsletter.`,
    inputSchema: JSON.stringify([
      { name: 'gymName', label: 'Gym Name', type: 'text', required: true },
      { name: 'month', label: 'Month', type: 'select', required: true, options: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'] },
      { name: 'highlights', label: 'Month Highlights', type: 'textarea', required: true, placeholder: 'Competition results, skills achieved, milestones...' },
      { name: 'upcomingEvents', label: 'Upcoming Events', type: 'textarea', placeholder: 'Comp dates, team photos, fundraisers, deadlines...' },
      { name: 'skillsSpotlight', label: 'Skills Spotlight', type: 'textarea', placeholder: 'What skills athletes are working on or just achieved...' },
      { name: 'athleteSpotlight', label: 'Athlete Spotlight', type: 'textarea', placeholder: 'Name and why they\'re being recognized this month...' },
      { name: 'reminders', label: 'Important Reminders', type: 'textarea', placeholder: 'Payment due, volunteer needed, etc.' },
      { name: 'gymNews', label: 'Gym News', type: 'textarea', placeholder: 'New coaches, facility updates, schedule changes...' },
    ]),
    tags: 'newsletter,communication,monthly,families',
  },
  {
    title: 'Competition Travel Itinerary',
    category: 'communication',
    description: 'Detailed travel itinerary for families attending away competitions.',
    promptTemplate: `Create a competition travel itinerary for {{gymName}} - {{teamName}}.
Travel details:
- Team: {{teamName}}
- Competition: {{compName}}
- Travel dates: {{travelDates}}
- Competition date: {{compDate}}
- Hotel: {{hotel}}
- Performance time: {{perfTime}}
- Travel method: {{travelMethod}}
- Costs: {{costs}}
- What to pack: {{packingNotes}}
- Coordinator: {{coordinator}}

Generate:
1. Full day-by-day itinerary with times
2. Packing list specific to this trip
3. Parent FAQ for the competition
4. Hotel and venue logistics info
5. Emergency contact information template
6. Post-competition celebration plan
7. Text reminder templates (day before, morning of)
Make it comprehensive and leave no question unanswered.`,
    inputSchema: JSON.stringify([
      { name: 'gymName', label: 'Gym Name', type: 'text', required: true },
      { name: 'teamName', label: 'Team Name', type: 'text', required: true },
      { name: 'compName', label: 'Competition Name', type: 'text', required: true },
      { name: 'travelDates', label: 'Travel Dates', type: 'text', required: true, placeholder: 'Friday Feb 14 - Sunday Feb 16' },
      { name: 'compDate', label: 'Competition Date/Day', type: 'text', required: true },
      { name: 'hotel', label: 'Hotel Name & Address', type: 'text', placeholder: 'Marriott, 123 Convention Blvd, Dallas TX' },
      { name: 'perfTime', label: 'Performance Time', type: 'text', placeholder: 'Saturday 2:30 PM - arrive by 12:00 PM' },
      { name: 'travelMethod', label: 'Travel Method', type: 'select', options: ['Charter Bus', 'Personal Vehicles', 'Carpool', 'Flight', 'Mixed'] },
      { name: 'costs', label: 'Costs', type: 'textarea', placeholder: 'Hotel: $150/night, entry: included in fees, food: own expense...' },
      { name: 'packingNotes', label: 'Special Packing Notes', type: 'textarea', placeholder: 'Uniform (hang-up bag), warm-up, hair supplies, etc.' },
      { name: 'coordinator', label: 'Trip Coordinator', type: 'text', placeholder: 'Parent volunteer name and contact' },
    ]),
    tags: 'travel,competition,logistics,communication',
  },
  {
    title: 'Registration Deadline Reminder',
    category: 'communication',
    description: 'Urgent but friendly reminder for registration or payment deadlines.',
    promptTemplate: `Create registration/deadline reminder communications for {{gymName}}.
Reminder details:
- Gym: {{gymName}}
- What is due: {{whatsDue}}
- Deadline: {{deadline}}
- Amount (if applicable): {{amount}}
- How to complete: {{howToComplete}}
- Consequences of missing deadline: {{consequences}}
- Contact: {{contact}}

Generate:
1. First reminder email (2 weeks before)
2. Second reminder email (1 week before)
3. FINAL reminder email (2 days before)
4. Text message versions of each (160 char limit)
5. Social media reminder post
Make them progressively more urgent while staying professional.`,
    inputSchema: JSON.stringify([
      { name: 'gymName', label: 'Gym Name', type: 'text', required: true },
      { name: 'whatsDue', label: 'What is Due', type: 'text', required: true, placeholder: 'Competition registration, uniform deposit, tryout form...' },
      { name: 'deadline', label: 'Deadline', type: 'text', required: true, placeholder: 'Friday, October 10th at 5 PM' },
      { name: 'amount', label: 'Amount (if payment)', type: 'text', placeholder: '$250 competition fee' },
      { name: 'howToComplete', label: 'How to Complete', type: 'text', required: true, placeholder: 'Pay via BAND app, email form to coach@gym.com, etc.' },
      { name: 'consequences', label: 'Consequence of Missing', type: 'text', placeholder: 'Athlete may not compete, spot may be given away...' },
      { name: 'contact', label: 'Contact for Questions', type: 'text', placeholder: 'coach@gymname.com or 555-1234' },
    ]),
    tags: 'deadline,reminder,registration,communication',
  },
  {
    title: 'Team Photo Day Announcement',
    category: 'communication',
    description: 'Everything families need to know for team photo day.',
    promptTemplate: `Create a team photo day announcement for {{gymName}}.
Photo day details:
- Gym: {{gymName}}
- Date: {{photoDate}}
- Time: {{photoTime}}
- Location: {{photoLocation}}
- Photographer: {{photographer}}
- Attire: {{attire}}
- Hair/makeup requirements: {{hairMakeup}}
- What to bring: {{whatToBring}}
- Photo packages: {{packages}}
- Contact: {{contact}}

Generate:
1. Full announcement email with all details
2. Hair/makeup specific instructions
3. Attire requirements with specifics
4. Day-of timeline for teams
5. Social media countdown post
6. FAQ for common photo day questions
7. Makeup tutorial resource list (if applicable)
Make it exciting and ensure no one shows up confused!`,
    inputSchema: JSON.stringify([
      { name: 'gymName', label: 'Gym Name', type: 'text', required: true },
      { name: 'photoDate', label: 'Photo Date', type: 'text', required: true },
      { name: 'photoTime', label: 'Photo Time(s)', type: 'text', required: true, placeholder: '10 AM - 2 PM, team times TBD' },
      { name: 'photoLocation', label: 'Location', type: 'text', required: true, placeholder: 'Main gym floor' },
      { name: 'photographer', label: 'Photographer/Company', type: 'text' },
      { name: 'attire', label: 'Attire Requirements', type: 'textarea', required: true, placeholder: 'Competition uniform, warm-up jacket, team bow...' },
      { name: 'hairMakeup', label: 'Hair/Makeup Requirements', type: 'textarea', placeholder: 'Competition-ready hair in team bow, full stage makeup...' },
      { name: 'whatToBring', label: 'What to Bring', type: 'textarea', placeholder: 'Uniform in hang-up bag, poms, prop items...' },
      { name: 'packages', label: 'Photo Packages', type: 'textarea', placeholder: 'Individual: $25, team: included, digital: $15...' },
      { name: 'contact', label: 'Questions Contact', type: 'text' },
    ]),
    tags: 'photos,announcement,logistics,communication',
  },
  {
    title: 'Volunteer Request',
    category: 'outreach',
    description: 'Recruit parent and community volunteers for gym events.',
    promptTemplate: `Create a volunteer request for {{gymName}}.
Volunteer details:
- Gym: {{gymName}}
- Event needing volunteers: {{eventName}}
- Date/time: {{eventDate}}
- Volunteer roles available: {{roles}}
- Time commitment: {{timeCommitment}}
- Skills needed: {{skills}}
- Benefits for volunteers: {{benefits}}
- Contact to sign up: {{contact}}

Generate:
1. Enthusiastic volunteer request email to parents
2. Social media post asking for community volunteers
3. Specific role descriptions with time commitments
4. Thank-you template for after the event
5. Volunteer sign-up reminder post
Make volunteering feel valuable and appreciated.`,
    inputSchema: JSON.stringify([
      { name: 'gymName', label: 'Gym Name', type: 'text', required: true },
      { name: 'eventName', label: 'Event Name', type: 'text', required: true, placeholder: 'Home showcase, fundraiser, photo day...' },
      { name: 'eventDate', label: 'Event Date/Time', type: 'text', required: true },
      { name: 'roles', label: 'Volunteer Roles Available', type: 'textarea', required: true, placeholder: 'Registration check-in, hair/makeup help, concessions, setup/cleanup...' },
      { name: 'timeCommitment', label: 'Time Commitment', type: 'text', placeholder: '4-6 hours, full day, 2 hour shifts' },
      { name: 'skills', label: 'Skills Needed', type: 'textarea', placeholder: 'No experience needed! Or: photography skills helpful...' },
      { name: 'benefits', label: 'Benefits for Volunteers', type: 'textarea', placeholder: 'Free event entry, meal provided, parent volunteer hours credit...' },
      { name: 'contact', label: 'How to Sign Up', type: 'text', placeholder: 'Reply to this email or sign up at link...' },
    ]),
    tags: 'volunteers,community,events,outreach',
  },

  // ── MORE MARKETING ─────────────────────────────────────────────────────────
  {
    title: 'Skills Camp Announcement',
    category: 'marketing',
    description: 'Promotional post for cheer or tumbling skills camps.',
    promptTemplate: `Create a skills camp announcement for {{gymName}}.
Camp details:
- Gym: {{gymName}}
- Camp name: {{campName}}
- Skills focus: {{skillsFocus}}
- Dates: {{campDates}}
- Times: {{campTimes}}
- Location: {{location}}
- Ages/levels: {{agesLevels}}
- Cost: {{cost}}
- What athletes will learn: {{learningGoals}}
- Instructor info: {{instructors}}
- Registration info: {{registration}}

Generate:
1. Instagram/Facebook announcement post
2. Parent-focused informational email
3. Text message blast for quick sign-ups
4. TikTok hook concept for camp promo
5. Google/Yelp review request for after the camp
Make it exciting enough that athletes BEGGING their parents to sign up!`,
    inputSchema: JSON.stringify([
      { name: 'gymName', label: 'Gym Name', type: 'text', required: true },
      { name: 'campName', label: 'Camp Name', type: 'text', required: true, placeholder: 'Summer Tumbling Intensive, Stunt Clinic...' },
      { name: 'skillsFocus', label: 'Skills Focus', type: 'text', required: true, placeholder: 'Tumbling, Stunting, Jumps, Full Routine, All Skills' },
      { name: 'campDates', label: 'Camp Dates', type: 'text', required: true, placeholder: 'July 14-18, 2025' },
      { name: 'campTimes', label: 'Camp Times', type: 'text', placeholder: '9 AM - 12 PM daily' },
      { name: 'location', label: 'Location', type: 'text', required: true },
      { name: 'agesLevels', label: 'Ages/Levels', type: 'text', required: true, placeholder: 'Ages 6-18, all levels welcome' },
      { name: 'cost', label: 'Cost', type: 'text', placeholder: '$199/athlete, early bird $175 before June 1' },
      { name: 'learningGoals', label: 'What Athletes Will Learn', type: 'textarea', placeholder: 'Skill progressions, conditioning, competitive tips...' },
      { name: 'instructors', label: 'Instructor Info', type: 'textarea', placeholder: 'World champions, certified coaches, guest instructors...' },
      { name: 'registration', label: 'How to Register', type: 'text', placeholder: 'Link to sign up or contact info' },
    ]),
    tags: 'camps,summer,training,marketing',
  },
  {
    title: 'Bid Announcement Post',
    category: 'marketing',
    description: 'Celebrating a bid qualification for worlds or major championships.',
    promptTemplate: `Create a bid announcement celebration for {{gymName}} - {{teamName}}.
Bid details:
- Gym: {{gymName}}
- Team: {{teamName}}
- Bid competition won: {{bidComp}}
- Championship qualifying for: {{championship}}
- Date/location of championship: {{champDetails}}
- How they earned it: {{howEarned}}
- Score/placement if applicable: {{score}}
- What this means: {{significance}}

Generate:
1. EXPLOSIVE bid announcement Instagram post (this is a BIG moment!)
2. Victory video caption
3. Emotional thank-you post to coaches, families, sponsors
4. Worlds countdown post template
5. Press release format for local media
6. Parent email announcing the bid
This is the BIGGEST moment in competitive cheer - make it feel monumental!`,
    inputSchema: JSON.stringify([
      { name: 'gymName', label: 'Gym Name', type: 'text', required: true },
      { name: 'teamName', label: 'Team Name', type: 'text', required: true },
      { name: 'bidComp', label: 'Bid Competition', type: 'text', required: true, placeholder: 'NCA All-Star Nationals, D2 Summit qualifier...' },
      { name: 'championship', label: 'Championship Qualifying For', type: 'select', required: true, options: ['The Summit', 'The D2 Summit', 'Worlds/ICU', 'NCA Nationals', 'UCA Nationals', 'Other'] },
      { name: 'champDetails', label: 'Championship Date/Location', type: 'text', placeholder: 'May 2026 at ESPN Wide World of Sports, Orlando FL' },
      { name: 'howEarned', label: 'How They Earned It', type: 'text', placeholder: 'Scored 92.3, placed 1st, at-large bid...' },
      { name: 'score', label: 'Score/Placement', type: 'text', placeholder: '1st place, 94.2 score' },
      { name: 'significance', label: 'What This Means', type: 'textarea', placeholder: 'First bid in gym history, back-to-back, etc.' },
    ]),
    tags: 'bid,worlds,championship,milestone',
  },
  {
    title: 'Alumni Spotlight Post',
    category: 'marketing',
    description: 'Feature post celebrating former athletes and their post-cheer success.',
    promptTemplate: `Create an alumni spotlight for {{gymName}} featuring {{alumniName}}.
Alumni details:
- Gym: {{gymName}}
- Alumni name: {{alumniName}}
- Years at gym: {{yearsAtGym}}
- Teams they competed on: {{teams}}
- Current achievements: {{currentLife}}
- How cheer helped them: {{cheerImpact}}
- Advice for current athletes: {{advice}}
- Photo description: {{photoDesc}}

Generate:
1. Instagram alumni spotlight post (heartwarming, community-building)
2. "Where are they now" story format
3. Alumni quote graphic text
4. Newsletter alumni feature section
5. LinkedIn-style professional mention if applicable
Make it feel like coming home - nostalgic but inspiring for current athletes.`,
    inputSchema: JSON.stringify([
      { name: 'gymName', label: 'Gym Name', type: 'text', required: true },
      { name: 'alumniName', label: 'Alumni Name', type: 'text', required: true },
      { name: 'yearsAtGym', label: 'Years at Gym', type: 'text', placeholder: '2010-2018 (8 years)' },
      { name: 'teams', label: 'Teams Competed On', type: 'text', placeholder: 'Mini Stars, Junior Elite, Senior Champion' },
      { name: 'currentLife', label: 'Current Achievements', type: 'textarea', required: true, placeholder: 'Graduated college, now a nurse, started own gym, coaching...' },
      { name: 'cheerImpact', label: 'How Cheer Shaped Them', type: 'textarea', placeholder: 'Leadership, discipline, teamwork, friendships...' },
      { name: 'advice', label: 'Advice for Current Athletes', type: 'textarea', placeholder: 'What they wish they knew, what to cherish...' },
      { name: 'photoDesc', label: 'Photo Description', type: 'text', placeholder: 'Then and now side-by-side, action shot from 2015 comp...' },
    ]),
    tags: 'alumni,spotlight,community,nostalgia',
  },
  {
    title: 'Athlete of the Week',
    category: 'marketing',
    description: 'Recognition post for a standout athlete of the week.',
    promptTemplate: `Create an Athlete of the Week spotlight for {{gymName}} featuring {{athleteName}}.
Details:
- Gym: {{gymName}}
- Athlete: {{athleteName}}
- Age/team: {{ageTeam}}
- Why they're being recognized: {{reason}}
- Recent achievement: {{achievement}}
- Fun facts: {{funFacts}}
- Quote from coach: {{coachQuote}}
- Athlete's goal: {{goal}}

Generate:
1. Social media Athlete of the Week post with energy and love
2. Story slide scripts (3 slides)
3. Recognition banner text for the gym display
4. Personal shoutout caption template
5. Parent notification message
Make the athlete feel like a superstar (because they are)!`,
    inputSchema: JSON.stringify([
      { name: 'gymName', label: 'Gym Name', type: 'text', required: true },
      { name: 'athleteName', label: 'Athlete Name', type: 'text', required: true, placeholder: 'Emma (first name only for privacy) or full name' },
      { name: 'ageTeam', label: 'Age and Team', type: 'text', required: true, placeholder: 'Age 12, Youth Level 2 Stars' },
      { name: 'reason', label: 'Why Being Recognized', type: 'textarea', required: true, placeholder: 'First back walkover, never missed practice, helped teammates...' },
      { name: 'achievement', label: 'Recent Achievement', type: 'text', placeholder: 'Finally hit her standing back tuck after 6 months!' },
      { name: 'funFacts', label: 'Fun Facts About Athlete', type: 'textarea', placeholder: 'Loves dance, wants to be a vet, favorite food is pizza...' },
      { name: 'coachQuote', label: 'Quote from Coach', type: 'textarea', placeholder: "She shows up every single day with the biggest smile..." },
      { name: 'goal', label: 'Athlete\'s Goal', type: 'text', placeholder: 'Make Senior Elite next season, compete at Worlds...' },
    ]),
    tags: 'recognition,athlete,spotlight,community',
  },
  {
    title: 'Open Gym Announcement',
    category: 'marketing',
    description: 'Promote open gym sessions for practice, recruiting, and community.',
    promptTemplate: `Create an open gym announcement for {{gymName}}.
Open gym details:
- Gym: {{gymName}}
- Type: {{openGymType}}
- Schedule: {{schedule}}
- Cost: {{cost}}
- Who can attend: {{whoCanAttend}}
- Equipment/features available: {{features}}
- Rules/requirements: {{rules}}
- Special guests/instructors: {{specialGuests}}
- Registration required: {{registration}}

Generate:
1. Social media announcement post
2. Regular weekly reminder caption
3. Parent FAQ for open gym
4. Promotional email to non-members
5. Text blast for existing members
Make it sound like the BEST place to practice!`,
    inputSchema: JSON.stringify([
      { name: 'gymName', label: 'Gym Name', type: 'text', required: true },
      { name: 'openGymType', label: 'Type of Open Gym', type: 'select', required: true, options: ['Tumbling Open Gym', 'All Skills Open Gym', 'Cheer Open Gym', 'Recruiting Open Gym', 'Holiday Open Gym', 'Drop-In Practice'] },
      { name: 'schedule', label: 'Schedule', type: 'text', required: true, placeholder: 'Every Friday 6-8 PM' },
      { name: 'cost', label: 'Cost', type: 'text', required: true, placeholder: '$15/session, free for members, $10 for non-members' },
      { name: 'whoCanAttend', label: 'Who Can Attend', type: 'text', required: true, placeholder: 'All athletes ages 5+, current members and non-members' },
      { name: 'features', label: 'Features Available', type: 'textarea', placeholder: 'Spring floor, tumbling track, foam pit, bungee harness...' },
      { name: 'rules', label: 'Rules/Requirements', type: 'textarea', placeholder: 'Waiver required, no outside food, proper athletic attire...' },
      { name: 'specialGuests', label: 'Special Guests/Instructors', type: 'text', placeholder: 'None, or "Guest tumbling coach this week!"' },
      { name: 'registration', label: 'Registration Required?', type: 'select', options: ['No registration needed, just show up!', 'Pre-register online', 'Call/text to reserve spot', 'Limited spots - first come first served'] },
    ]),
    tags: 'open gym,drop-in,recruiting,community',
  },
  {
    title: 'New Uniform Reveal',
    category: 'marketing',
    description: 'Hype-building post revealing new team uniforms.',
    promptTemplate: `Create a new uniform reveal campaign for {{gymName}}.
Uniform details:
- Gym: {{gymName}}
- Teams getting new uniforms: {{teams}}
- Uniform company: {{uniformCompany}}
- Colors: {{colors}}
- Style description: {{styleDesc}}
- When athletes get them: {{deliveryDate}}
- First wear date (comp/event): {{firstWear}}
- Design inspiration: {{inspiration}}

Generate:
1. Teaser post (silhouette or close-up with no full reveal)
2. Full reveal announcement post (DRAMATIC!)
3. Story countdown (3-2-1 reveal format)
4. Parent notification about delivery
5. First game/comp day "uniform debut" caption template
6. Behind-the-scenes design process post
Build maximum anticipation like a major brand launch!`,
    inputSchema: JSON.stringify([
      { name: 'gymName', label: 'Gym Name', type: 'text', required: true },
      { name: 'teams', label: 'Teams Getting New Uniforms', type: 'text', required: true, placeholder: 'All teams, Senior Elite only, etc.' },
      { name: 'uniformCompany', label: 'Uniform Company', type: 'text', placeholder: 'Varsity, Rebel Athletic, Pizzazz, custom designer...' },
      { name: 'colors', label: 'Uniform Colors', type: 'text', required: true, placeholder: 'Royal blue, silver, and white with holographic accents' },
      { name: 'styleDesc', label: 'Style Description', type: 'textarea', required: true, placeholder: 'Sleek crop top, high-waist skirt, full rhinestone detailing...' },
      { name: 'deliveryDate', label: 'Delivery Date', type: 'text', placeholder: 'September 15, 2025' },
      { name: 'firstWear', label: 'First Wear Date', type: 'text', placeholder: 'First competition October 5th' },
      { name: 'inspiration', label: 'Design Inspiration', type: 'textarea', placeholder: 'Champions League vibes, throwback to our 2019 championship unis, etc.' },
    ]),
    tags: 'uniforms,reveal,fashion,hype',
  },
  {
    title: 'End of Season Recap',
    category: 'marketing',
    description: 'Comprehensive end-of-season celebration and gratitude post.',
    promptTemplate: `Create an end of season recap for {{gymName}} - {{season}} Season.
Season recap:
- Gym: {{gymName}}
- Season: {{season}}
- Teams/divisions: {{teams}}
- Total competitions: {{competitionCount}}
- Major wins/achievements: {{achievements}}
- Titles won: {{titles}}
- Athletes who leveled up: {{advances}}
- Coaches/staff to recognize: {{staff}}
- Thank-yous: {{thankYous}}
- Looking ahead to next season: {{lookingAhead}}

Generate:
1. Grand season recap Instagram post
2. Individual team recap for each team listed
3. Coach and staff appreciation post
4. Parent/family thank-you post
5. "See you next season" teaser post
6. Season highlight reel caption
7. Year in review email to all families
Make it emotional, grateful, and set the stage for an even better next season.`,
    inputSchema: JSON.stringify([
      { name: 'gymName', label: 'Gym Name', type: 'text', required: true },
      { name: 'season', label: 'Season', type: 'text', required: true, placeholder: '2024-2025' },
      { name: 'teams', label: 'Teams/Divisions', type: 'textarea', required: true, placeholder: 'Mini Glitter, Youth Stars, Junior Elite, Senior Champion...' },
      { name: 'competitionCount', label: 'Total Competitions', type: 'text', placeholder: '8 competitions this season' },
      { name: 'achievements', label: 'Major Achievements', type: 'textarea', required: true, placeholder: 'First place finishes, skill milestones, personal bests...' },
      { name: 'titles', label: 'Titles Won', type: 'textarea', placeholder: 'State champions, regional winners, bid earners...' },
      { name: 'advances', label: 'Athletes Who Advanced Levels', type: 'textarea', placeholder: 'Athletes moving from Level 2 to Level 3...' },
      { name: 'staff', label: 'Coaches/Staff to Recognize', type: 'textarea', placeholder: 'Head coaches, assistant coaches, choreographers...' },
      { name: 'thankYous', label: 'Special Thank-Yous', type: 'textarea', placeholder: 'Parent volunteers, sponsors, local businesses...' },
      { name: 'lookingAhead', label: 'Looking Ahead to Next Season', type: 'text', placeholder: 'Tryouts in June, new teams forming, expansion plans...' },
    ]),
    tags: 'end of season,recap,gratitude,celebration',
  },
  {
    title: 'Score Breakdown Parent Email',
    category: 'communication',
    description: 'Clear explanation of competition scores for parents to understand.',
    promptTemplate: `Write a score breakdown parent email for {{gymName}} - {{teamName}}.
Score details:
- Team: {{teamName}}
- Competition: {{compName}}
- Division: {{division}}
- Scoring system: {{scoringSystem}}
- Score received: {{score}}
- Breakdown by category: {{scoreBreakdown}}
- Strengths: {{strengths}}
- Areas to improve: {{improvements}}
- Comparison to previous: {{previousScore}}
- Next steps: {{nextSteps}}

Generate:
1. Clear, parent-friendly email explaining the score
2. Visual breakdown summary (text format)
3. What the score means for placement/rankings
4. Positive framing of areas to improve
5. Action plan for improvements
6. Encouragement and next steps
Translate judge language into what parents can understand and act on.`,
    inputSchema: JSON.stringify([
      { name: 'gymName', label: 'Gym Name', type: 'text', required: true },
      { name: 'teamName', label: 'Team Name', type: 'text', required: true },
      { name: 'compName', label: 'Competition Name', type: 'text', required: true },
      { name: 'division', label: 'Division', type: 'text', required: true, placeholder: 'Senior Level 4 Large Coed' },
      { name: 'scoringSystem', label: 'Scoring System', type: 'select', required: true, options: ['USASF', 'NCA', 'UCA', 'ICU', 'Other'] },
      { name: 'score', label: 'Total Score', type: 'text', required: true, placeholder: '87.4 out of 100' },
      { name: 'scoreBreakdown', label: 'Score Breakdown by Category', type: 'textarea', required: true, placeholder: 'Stunts: 28/30, Tumbling: 22/25, Jumps: 18/20...' },
      { name: 'strengths', label: 'Strengths This Competition', type: 'textarea', placeholder: 'Clean stunts, improved tumbling execution...' },
      { name: 'improvements', label: 'Areas to Improve', type: 'textarea', placeholder: 'Jump synchronization, pyramid timing...' },
      { name: 'previousScore', label: 'Previous Score (if applicable)', type: 'text', placeholder: '84.2 at last competition (up 3.2 points!)' },
      { name: 'nextSteps', label: 'Next Steps', type: 'textarea', placeholder: 'Extra jump practice this week, private stunt sessions...' },
    ]),
    tags: 'scores,communication,parents,competition',
  },
];

async function main() {
  console.log('🌱 Seeding database...');

  // ── Admin user ─────────────────────────────────────────────────────────────
  const adminPassword = await bcrypt.hash('admin123', 12);
  await db.user.upsert({
    where: { email: 'admin@cheerai.app' },
    update: {},
    create: {
      email: 'admin@cheerai.app',
      name: 'Admin',
      password: adminPassword,
      role: 'admin',
      subscription: 'pro',
    },
  });

  // ── Demo user ──────────────────────────────────────────────────────────────
  const demoPassword = await bcrypt.hash('demo1234', 12);
  await db.user.upsert({
    where: { email: 'demo@cheerai.app' },
    update: {},
    create: {
      email: 'demo@cheerai.app',
      name: 'Coach Taylor',
      password: demoPassword,
      role: 'user',
      subscription: 'pro',
    },
  });

  // ── Brand Packs ────────────────────────────────────────────────────────────
  const packs = [
    {
      name: 'Rave Comp',
      vibe: 'rave-comp',
      description: 'Bold neons, electric energy, hype-crowd ready.',
      colors: JSON.stringify(['#FF006E', '#FB5607', '#FFBE0B', '#8338EC', '#3A86FF']),
      tone: 'hype',
      emoji: '⚡',
      exampleCopy:
        'THE FLOOR IS OURS. Lights up. Music drops. Watch [Gym Name] tear it apart at [Event]. This is not a drill. 🔥',
      featured: true,
    },
    {
      name: 'Legacy Classic',
      vibe: 'legacy-classic',
      description: 'Deep jewel tones, timeless prestige, championship pedigree.',
      colors: JSON.stringify(['#1B1F3B', '#C5A028', '#7B2D8B', '#FFFFFF', '#2E4057']),
      tone: 'elegant',
      emoji: '👑',
      exampleCopy:
        'Champions are built over seasons, not days. [Gym Name] brings legacy to the mat at [Event]. Honor the grind.',
      featured: true,
    },
    {
      name: 'Sparkly Glam',
      vibe: 'sparkly-glam',
      description: 'Pastels, holographic shimmer, cheerleader-pink perfection.',
      colors: JSON.stringify(['#FF85A1', '#FFC8DD', '#BDE0FE', '#CAFFBF', '#FFD6FF']),
      tone: 'playful',
      emoji: '✨',
      exampleCopy:
        'Sparkle season is HERE. ✨ [Gym Name] is bringing ALL the glam to [Event] and we are NOT holding back. Get ready, babe.',
      featured: true,
    },
    {
      name: 'Clean Minimal',
      vibe: 'clean-minimal',
      description: 'White space, sharp typography, modern and professional.',
      colors: JSON.stringify(['#111827', '#F9FAFB', '#6366F1', '#E5E7EB', '#4F46E5']),
      tone: 'clean',
      emoji: '◻️',
      exampleCopy:
        '[Gym Name]. [Event]. [Date]. We\'ll let the score sheet speak for itself.',
      featured: false,
    },
    {
      name: 'School Spirit',
      vibe: 'school-spirit',
      description: 'Classic school colors energy — adaptable, crowd-rallying.',
      colors: JSON.stringify(['#D00000', '#FFBA08', '#FFFFFF', '#3F88C5', '#032B43']),
      tone: 'hype',
      emoji: '📣',
      exampleCopy:
        'Friday night feels. [Gym Name] goes ALL OUT for [Event]. Bring your school pride and your loudest voice! 📣',
      featured: false,
    },
  ];

  for (const pack of packs) {
    await db.brandPack.upsert({
      where: { vibe: pack.vibe } as never,
      update: pack,
      create: pack,
    });
  }

  // ── Templates ──────────────────────────────────────────────────────────────
  console.log('  Seeding templates...');
  for (const template of TEMPLATES) {
    const existing = await db.template.findFirst({
      where: { title: template.title, isSystem: true },
    });
    if (!existing) {
      await db.template.create({
        data: {
          ...template,
          isSystem: true,
          userId: null,
        },
      });
    }
  }

  console.log('✅ Seed complete!');
  console.log('   Admin:  admin@cheerai.app / admin123');
  console.log('   Demo:   demo@cheerai.app  / demo1234');
  console.log(`   Templates: ${TEMPLATES.length} system templates seeded`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
