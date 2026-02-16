import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create a default user (will be linked to Clerk on first sign-in)
  const user = await prisma.user.upsert({
    where: { email: "nataly@vivancedata.com" },
    update: {},
    create: {
      clerkId: "seed_user_placeholder",
      email: "nataly@vivancedata.com",
      name: "Nataly Scaturchio",
      role: "ADMIN",
    },
  });

  // Companies
  const companies = await Promise.all([
    prisma.company.create({
      data: {
        name: "Martinez Construction",
        website: "https://martinez-construction.com",
        industry: "CONSTRUCTION",
        size: "MEDIUM",
        description: "Full-service construction company specializing in commercial projects",
        phone: "(512) 555-0101",
        city: "Austin",
        state: "TX",
        zipCode: "78701",
        country: "USA",
        createdById: user.id,
      },
    }),
    prisma.company.create({
      data: {
        name: "Green Valley HVAC",
        website: "https://greenvalleyhvac.com",
        industry: "HVAC",
        size: "SMALL",
        description: "Residential and commercial HVAC installation and maintenance",
        phone: "(512) 555-0102",
        city: "Round Rock",
        state: "TX",
        zipCode: "78664",
        country: "USA",
        createdById: user.id,
      },
    }),
    prisma.company.create({
      data: {
        name: "TechStart Inc",
        website: "https://techstart.io",
        industry: "STARTUP",
        size: "SMALL",
        description: "Early-stage tech startup building SaaS tools for SMBs",
        phone: "(415) 555-0103",
        city: "San Francisco",
        state: "CA",
        zipCode: "94105",
        country: "USA",
        createdById: user.id,
      },
    }),
    prisma.company.create({
      data: {
        name: "Smith Logistics",
        website: "https://smithlogistics.com",
        industry: "LOGISTICS",
        size: "LARGE",
        description: "Regional logistics and supply chain management",
        phone: "(214) 555-0104",
        city: "Dallas",
        state: "TX",
        zipCode: "75201",
        country: "USA",
        createdById: user.id,
      },
    }),
    prisma.company.create({
      data: {
        name: "Precision Manufacturing",
        website: "https://precisionmfg.com",
        industry: "MANUFACTURING",
        size: "ENTERPRISE",
        description: "Precision metal fabrication and CNC machining for aerospace",
        phone: "(713) 555-0105",
        city: "Houston",
        state: "TX",
        zipCode: "77001",
        country: "USA",
        createdById: user.id,
      },
    }),
    prisma.company.create({
      data: {
        name: "Metro Electric",
        website: "https://metroelectric.com",
        industry: "ELECTRICAL",
        size: "MEDIUM",
        description: "Commercial and industrial electrical contracting",
        phone: "(512) 555-0106",
        city: "Austin",
        state: "TX",
        zipCode: "78702",
        country: "USA",
        createdById: user.id,
      },
    }),
    prisma.company.create({
      data: {
        name: "BuildRight Co",
        website: "https://buildright.co",
        industry: "CONSTRUCTION",
        size: "SMALL",
        description: "Residential construction and renovation services",
        phone: "(512) 555-0107",
        city: "Cedar Park",
        state: "TX",
        zipCode: "78613",
        country: "USA",
        createdById: user.id,
      },
    }),
    prisma.company.create({
      data: {
        name: "Valley Plumbing",
        industry: "PLUMBING",
        size: "SMALL",
        phone: "(512) 555-0108",
        city: "Georgetown",
        state: "TX",
        zipCode: "78626",
        country: "USA",
        createdById: user.id,
      },
    }),
  ]);

  // Contacts
  const contacts = await Promise.all([
    prisma.contact.create({
      data: {
        firstName: "Carlos",
        lastName: "Martinez",
        email: "carlos@martinez-construction.com",
        phone: "(512) 555-1001",
        title: "CEO",
        isPrimary: true,
        source: "REFERRAL",
        companyId: companies[0].id,
        createdById: user.id,
      },
    }),
    prisma.contact.create({
      data: {
        firstName: "Sarah",
        lastName: "Johnson",
        email: "sarah@greenvalleyhvac.com",
        phone: "(512) 555-1002",
        title: "Operations Manager",
        isPrimary: true,
        source: "LINKEDIN",
        companyId: companies[1].id,
        createdById: user.id,
      },
    }),
    prisma.contact.create({
      data: {
        firstName: "Mike",
        lastName: "Chen",
        email: "mike@techstart.io",
        phone: "(415) 555-1003",
        title: "CTO",
        isPrimary: true,
        source: "WEBSITE",
        companyId: companies[2].id,
        createdById: user.id,
      },
    }),
    prisma.contact.create({
      data: {
        firstName: "David",
        lastName: "Smith",
        email: "david@smithlogistics.com",
        phone: "(214) 555-1004",
        title: "VP of Operations",
        isPrimary: true,
        source: "EVENT",
        companyId: companies[3].id,
        createdById: user.id,
      },
    }),
    prisma.contact.create({
      data: {
        firstName: "Jennifer",
        lastName: "Lee",
        email: "jennifer@precisionmfg.com",
        phone: "(713) 555-1005",
        title: "Director of Technology",
        isPrimary: true,
        source: "COLD_OUTREACH",
        companyId: companies[4].id,
        createdById: user.id,
      },
    }),
    prisma.contact.create({
      data: {
        firstName: "James",
        lastName: "Brown",
        email: "james@metroelectric.com",
        phone: "(512) 555-1006",
        title: "Owner",
        isPrimary: true,
        source: "REFERRAL",
        companyId: companies[5].id,
        createdById: user.id,
      },
    }),
    prisma.contact.create({
      data: {
        firstName: "Amy",
        lastName: "Clark",
        email: "amy@buildright.co",
        phone: "(512) 555-1007",
        title: "Project Manager",
        isPrimary: true,
        source: "LINKEDIN",
        companyId: companies[6].id,
        createdById: user.id,
      },
    }),
    prisma.contact.create({
      data: {
        firstName: "Tom",
        lastName: "Wilson",
        email: "tom@valleyplumbing.com",
        phone: "(512) 555-1008",
        title: "Owner",
        isPrimary: true,
        source: "WEBSITE",
        companyId: companies[7].id,
        createdById: user.id,
      },
    }),
    prisma.contact.create({
      data: {
        firstName: "Maria",
        lastName: "Garcia",
        email: "maria@martinez-construction.com",
        phone: "(512) 555-1009",
        title: "Office Manager",
        source: "REFERRAL",
        companyId: companies[0].id,
        createdById: user.id,
      },
    }),
    prisma.contact.create({
      data: {
        firstName: "Robert",
        lastName: "Taylor",
        email: "robert@smithlogistics.com",
        phone: "(214) 555-1010",
        title: "Fleet Manager",
        source: "EVENT",
        companyId: companies[3].id,
        createdById: user.id,
      },
    }),
    prisma.contact.create({
      data: {
        firstName: "Lisa",
        lastName: "Anderson",
        email: "lisa@precisionmfg.com",
        phone: "(713) 555-1011",
        title: "CFO",
        source: "COLD_OUTREACH",
        companyId: companies[4].id,
        createdById: user.id,
      },
    }),
    prisma.contact.create({
      data: {
        firstName: "Kevin",
        lastName: "Patel",
        email: "kevin@techstart.io",
        phone: "(415) 555-1012",
        title: "CEO",
        source: "WEBSITE",
        companyId: companies[2].id,
        createdById: user.id,
      },
    }),
  ]);

  // Deals across pipeline stages
  await Promise.all([
    // LEAD stage
    prisma.deal.create({
      data: {
        title: "AI Workflow Automation",
        value: 15000,
        stage: "LEAD",
        probability: 10,
        serviceType: "INTEGRATION",
        expectedClose: new Date("2026-04-15"),
        companyId: companies[0].id,
        contactId: contacts[0].id,
        ownerId: user.id,
      },
    }),
    prisma.deal.create({
      data: {
        title: "Data Analytics Setup",
        value: 8000,
        stage: "LEAD",
        probability: 10,
        serviceType: "CONSULTING",
        expectedClose: new Date("2026-04-30"),
        companyId: companies[7].id,
        contactId: contacts[7].id,
        ownerId: user.id,
      },
    }),
    // QUALIFIED stage
    prisma.deal.create({
      data: {
        title: "AI Customer Service Bot",
        value: 25000,
        stage: "QUALIFIED",
        probability: 25,
        serviceType: "INTEGRATION",
        expectedClose: new Date("2026-03-30"),
        companyId: companies[1].id,
        contactId: contacts[1].id,
        ownerId: user.id,
      },
    }),
    prisma.deal.create({
      data: {
        title: "Process Automation Suite",
        value: 18000,
        stage: "QUALIFIED",
        probability: 25,
        serviceType: "CONSULTING",
        expectedClose: new Date("2026-04-15"),
        companyId: companies[5].id,
        contactId: contacts[5].id,
        ownerId: user.id,
      },
    }),
    // DISCOVERY stage
    prisma.deal.create({
      data: {
        title: "Inventory AI System",
        value: 32000,
        stage: "DISCOVERY",
        probability: 40,
        serviceType: "INTEGRATION",
        expectedClose: new Date("2026-03-15"),
        companyId: companies[3].id,
        contactId: contacts[3].id,
        ownerId: user.id,
      },
    }),
    // PROPOSAL stage
    prisma.deal.create({
      data: {
        title: "Full AI Integration Package",
        value: 45000,
        stage: "PROPOSAL",
        probability: 60,
        serviceType: "CUSTOM",
        expectedClose: new Date("2026-03-01"),
        companyId: companies[2].id,
        contactId: contacts[2].id,
        ownerId: user.id,
      },
    }),
    prisma.deal.create({
      data: {
        title: "Team AI Training Program",
        value: 12000,
        stage: "PROPOSAL",
        probability: 60,
        serviceType: "TRAINING",
        expectedClose: new Date("2026-03-15"),
        companyId: companies[6].id,
        contactId: contacts[6].id,
        ownerId: user.id,
      },
    }),
    // NEGOTIATION stage
    prisma.deal.create({
      data: {
        title: "Enterprise AI Package",
        value: 75000,
        stage: "NEGOTIATION",
        probability: 80,
        serviceType: "CUSTOM",
        expectedClose: new Date("2026-02-28"),
        companyId: companies[4].id,
        contactId: contacts[4].id,
        ownerId: user.id,
      },
    }),
    // WON (closed)
    prisma.deal.create({
      data: {
        title: "Predictive Maintenance AI",
        value: 35000,
        stage: "WON",
        probability: 100,
        serviceType: "INTEGRATION",
        expectedClose: new Date("2026-01-15"),
        actualClose: new Date("2026-01-20"),
        companyId: companies[4].id,
        contactId: contacts[4].id,
        ownerId: user.id,
      },
    }),
    // LOST (closed)
    prisma.deal.create({
      data: {
        title: "Chatbot Implementation",
        value: 10000,
        stage: "LOST",
        probability: 0,
        serviceType: "INTEGRATION",
        lostReason: "Budget constraints - revisit Q2",
        actualClose: new Date("2026-01-25"),
        companyId: companies[1].id,
        contactId: contacts[1].id,
        ownerId: user.id,
      },
    }),
  ]);

  // Activities
  await Promise.all([
    prisma.activity.create({
      data: {
        type: "CALL",
        subject: "Discovery call with Martinez Construction",
        description: "Discussed AI workflow automation needs. Very interested in reducing manual data entry.",
        duration: 30,
        userId: user.id,
        contactId: contacts[0].id,
        companyId: companies[0].id,
        occurredAt: new Date(Date.now() - 1000 * 60 * 30),
      },
    }),
    prisma.activity.create({
      data: {
        type: "EMAIL",
        subject: "Sent AI integration proposal to TechStart",
        userId: user.id,
        contactId: contacts[2].id,
        companyId: companies[2].id,
        occurredAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
      },
    }),
    prisma.activity.create({
      data: {
        type: "DEAL_STAGE_CHANGE",
        subject: "Deal moved to Proposal stage",
        userId: user.id,
        contactId: contacts[2].id,
        companyId: companies[2].id,
        occurredAt: new Date(Date.now() - 1000 * 60 * 60 * 4),
      },
    }),
    prisma.activity.create({
      data: {
        type: "MEETING",
        subject: "AI workflow demo with Smith Logistics",
        description: "Showed inventory prediction module. They want a custom solution.",
        duration: 60,
        userId: user.id,
        contactId: contacts[3].id,
        companyId: companies[3].id,
        occurredAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
      },
    }),
    prisma.activity.create({
      data: {
        type: "TASK_COMPLETED",
        subject: "Completed contract review for Precision Mfg",
        userId: user.id,
        contactId: contacts[4].id,
        companyId: companies[4].id,
        occurredAt: new Date(Date.now() - 1000 * 60 * 60 * 26),
      },
    }),
  ]);

  // Tasks
  await Promise.all([
    prisma.task.create({
      data: {
        title: "Follow up with Martinez Construction",
        description: "Send case study and schedule technical demo",
        dueDate: new Date(),
        priority: "HIGH",
        assigneeId: user.id,
        contactId: contacts[0].id,
      },
    }),
    prisma.task.create({
      data: {
        title: "Send proposal to Green Valley HVAC",
        description: "Prepare AI customer service bot proposal",
        dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24),
        priority: "URGENT",
        assigneeId: user.id,
        contactId: contacts[1].id,
      },
    }),
    prisma.task.create({
      data: {
        title: "Schedule demo for TechStart Inc",
        description: "Coordinate with Mike Chen for full integration demo",
        dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2),
        priority: "MEDIUM",
        assigneeId: user.id,
        contactId: contacts[2].id,
      },
    }),
    prisma.task.create({
      data: {
        title: "Review contract terms with Smith Logistics",
        description: "Legal review of SLA and data handling terms",
        dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3),
        priority: "HIGH",
        assigneeId: user.id,
        contactId: contacts[3].id,
      },
    }),
    prisma.task.create({
      data: {
        title: "Prepare training materials for BuildRight Co",
        description: "Create slide deck and hands-on exercises for AI training",
        dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5),
        priority: "MEDIUM",
        assigneeId: user.id,
        contactId: contacts[6].id,
      },
    }),
  ]);

  console.log("Seed complete!");
  console.log(`Created: ${companies.length} companies, ${contacts.length} contacts, 10 deals, 5 activities, 5 tasks`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
