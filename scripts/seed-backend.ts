import axios, { AxiosInstance } from "axios";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function loadEnv() {
  const envPath = path.resolve(__dirname, "..", ".env");
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, "utf-8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith("#")) {
        const [key, ...valueParts] = trimmed.split("=");
        if (key && valueParts.length) {
          process.env[key.trim()] = valueParts.join("=").trim();
        }
      }
    }
  }
}

loadEnv();

const API_URL = process.env.VITE_API_URL || "http://localhost:8188";
const API_BASE = `${API_URL}/api`;

const SEED_EMAIL = process.env.SEED_EMAIL || "admin@example.com";
const SEED_PASSWORD = process.env.SEED_PASSWORD || "admin123";

interface LeadType {
  name: string;
  code?: string;
  sort_order?: number;
  is_active?: boolean;
}

interface LeadSource {
  name: string;
  description?: string | null;
  is_active: boolean;
}

interface LeadStatus {
  name: string;
  color: string;
  sort_order: number;
  is_final: boolean;
  is_active: boolean;
}

interface LeadPriority {
  name: string;
  color: string;
  sort_order: number;
  is_active: boolean;
}

interface Campaign {
  name: string;
  source: number | null;
  start_date?: string | null;
  end_date?: string | null;
  budget?: string | null;
  is_active: boolean;
}

interface Course {
  course_type: "course" | "master_class" | "job_ready_program";
  name: string;
  full_amount: string;
  one_time_payment_discount: string | null;
  syllabus?: string | null;
  remarks?: string | null;
}

interface Branch {
  name: string;
  code: string;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  is_active?: boolean;
}

interface Batch {
  name: string;
  description?: string | null;
  is_active?: boolean;
  branch?: number | null;
}

const LEAD_TYPES: LeadType[] = [
  { name: "Course Inquiry", code: "course_inquiry", sort_order: 1, is_active: true },
  { name: "Master Class Inquiry", code: "master_class_inquiry", sort_order: 2, is_active: true },
  { name: "General Inquiry", code: "general_inquiry", sort_order: 3, is_active: true },
  { name: "Corporate Inquiry", code: "corporate_inquiry", sort_order: 4, is_active: true },
];

const LEAD_SOURCES: LeadSource[] = [
  { name: "Website", description: "Website form submission", is_active: true },
  { name: "Facebook", description: "Facebook ads/page", is_active: true },
  { name: "Instagram", description: "Instagram ads/profile", is_active: true },
  { name: "TikTok", description: "TikTok ads/profile", is_active: true },
  { name: "WhatsApp", description: "WhatsApp business/chat", is_active: true },
  { name: "Viber", description: "Viber business/chat", is_active: true },
  { name: "Telephone", description: "Incoming phone call", is_active: true },
  { name: "Direct Call", description: "Outbound direct call", is_active: true },
  { name: "Walk-in / Direct Visit", description: "Physical visit to office", is_active: true },
  { name: "Referral", description: "Referral from existing student/lead", is_active: true },
  { name: "Online Counseling", description: "Online counseling session", is_active: true },
  { name: "Google Search", description: "Organic Google search", is_active: true },
  { name: "Shramsansar", description: "Shramsansar job portal", is_active: true },
  { name: "Orbit (Social Media)", description: "Orbit social media campaign", is_active: true },
  { name: "Manual Entry", description: "Manually entered by staff", is_active: true },
];

const LEAD_STATUSES: LeadStatus[] = [
  { name: "New", color: "#3B82F6", sort_order: 1, is_final: false, is_active: true },
  { name: "Contact Attempted", color: "#60A5FA", sort_order: 2, is_final: false, is_active: true },
  { name: "Contacted", color: "#0EA5E9", sort_order: 3, is_final: false, is_active: true },
  { name: "Follow-up Scheduled", color: "#06B6D4", sort_order: 4, is_final: false, is_active: true },
  { name: "Qualified", color: "#22C55E", sort_order: 5, is_final: false, is_active: true },
  { name: "Counseling Completed", color: "#16A34A", sort_order: 6, is_final: false, is_active: true },
  { name: "Enrollment Pending", color: "#EAB308", sort_order: 7, is_final: false, is_active: true },
  { name: "Enrolled", color: "#15803D", sort_order: 8, is_final: true, is_active: true },
  { name: "Lost", color: "#EF4444", sort_order: 9, is_final: true, is_active: true },
  { name: "Not Interested", color: "#DC2626", sort_order: 10, is_final: true, is_active: true },
  { name: "Invalid", color: "#9CA3AF", sort_order: 11, is_final: true, is_active: true },
  { name: "Duplicate", color: "#6B7280", sort_order: 12, is_final: true, is_active: true },
  { name: "On Hold", color: "#F59E0B", sort_order: 13, is_final: false, is_active: true },
];

const LEAD_PRIORITIES: LeadPriority[] = [
  { name: "Hot", color: "#EF4444", sort_order: 1, is_active: true },
  { name: "Warm", color: "#F59E0B", sort_order: 2, is_active: true },
  { name: "Cool", color: "#3B82F6", sort_order: 3, is_active: true },
  { name: "Cold", color: "#9CA3AF", sort_order: 4, is_active: true },
];

const CAMPAIGNS: Campaign[] = [
  { name: "SEE 2083 Campaign", source: null, is_active: true },
  { name: "Dashain Admission Campaign", source: null, is_active: true },
  { name: "Facebook UI/UX Campaign", source: null, is_active: true },
  { name: "Master Class October 2025", source: null, is_active: true },
  { name: "Instagram Digital Marketing", source: null, is_active: true },
];

const COURSES: Course[] = [
  { course_type: "course", name: "Full-Stack MERN Diploma Course", full_amount: "37500.00", one_time_payment_discount: "7500.00", syllabus: "https://cutt.ly/vritmernsyllabus", remarks: "" },
  { course_type: "course", name: "Frontend with React Diploma Course", full_amount: "30000.00", one_time_payment_discount: "5000.00", syllabus: "https://cutt.ly/vritnewfrontendsyllabus", remarks: "" },
  { course_type: "course", name: "Python Django Diploma Course", full_amount: "30000.00", one_time_payment_discount: "6000.00", syllabus: "https://cutt.ly/vritdjangosyllabus", remarks: "" },
  { course_type: "course", name: "Data Science and Machine Learning Diploma Course", full_amount: "35000.00", one_time_payment_discount: "7000.00", syllabus: "https://cutt.ly/vritaimlsyllabus", remarks: "" },
  { course_type: "course", name: "Complete Flutter Diploma Course", full_amount: "25000.00", one_time_payment_discount: "5000.00", syllabus: "https://cutt.ly/vritfluttersyllabus", remarks: "" },
  { course_type: "course", name: "Digital Marketing Diploma Course", full_amount: "25000.00", one_time_payment_discount: "5000.00", syllabus: "https://cutt.ly/vritdigitalmsyllabus", remarks: "" },
  { course_type: "course", name: "UI UX Design Diploma Course", full_amount: "25000.00", one_time_payment_discount: "5000.00", syllabus: "https://cutt.ly/vrituiuxsyllabus", remarks: "" },
  { course_type: "course", name: "DevOps Diploma Course", full_amount: "30000.00", one_time_payment_discount: "5000.00", syllabus: "https://cutt.ly/vritdevopssyllabus", remarks: "" },
  { course_type: "course", name: "Quality Assurance (QA) Diploma Course", full_amount: "30000.00", one_time_payment_discount: "6000.00", syllabus: "https://cutt.ly/vritqasyllabus", remarks: "" },
  { course_type: "course", name: "Project Management Diploma Course", full_amount: "30000.00", one_time_payment_discount: "5000.00", syllabus: "https://cutt.ly/vritpmsyllabus", remarks: "" },
  { course_type: "course", name: "Graphic Designing Diploma Course", full_amount: "25000.00", one_time_payment_discount: "5000.00", syllabus: "https://cutt.ly/vritgraphicdesignsyllabus", remarks: "" },
  { course_type: "course", name: "WordPress Diploma Course", full_amount: "25000.00", one_time_payment_discount: "5000.00", syllabus: "https://cutt.ly/vritwordpresssyllabus", remarks: "" },
  { course_type: "course", name: "Human Resource Diploma Course", full_amount: "25000.00", one_time_payment_discount: "5000.00", syllabus: "https://cutt.ly/vrithrsyllabus", remarks: "" },
  { course_type: "course", name: "Video Editing Diploma Course", full_amount: "25000.00", one_time_payment_discount: "5000.00", syllabus: "https://cutt.ly/vritvideoeditingsyllabus", remarks: "" },
  { course_type: "course", name: "Cybersecurity Diploma Course", full_amount: "30000.00", one_time_payment_discount: "5000.00", syllabus: "https://cutt.ly/vritcybersecuritysyllabus", remarks: "" },
  { course_type: "course", name: "Data Structures & Algorithms Diploma Course", full_amount: "25000.00", one_time_payment_discount: "5000.00", syllabus: "https://cutt.ly/vritdsasyllabus", remarks: "" },
  { course_type: "course", name: "Master Gen AI and Build Smarter AI Agent (Agentic AI)", full_amount: "35000.00", one_time_payment_discount: "5000.00", syllabus: null, remarks: "" },
  { course_type: "course", name: "Generative AI (GEN AI)", full_amount: "25000.00", one_time_payment_discount: "5000.00", syllabus: null, remarks: "" },
  { course_type: "course", name: "Business Data Analytics with AI", full_amount: "30000.00", one_time_payment_discount: "5000.00", syllabus: null, remarks: "" },
  { course_type: "course", name: "Video Editing Course", full_amount: "25000.00", one_time_payment_discount: "5000.00", syllabus: null, remarks: "" },
  { course_type: "course", name: "Software Engineering With AI Course", full_amount: "37500.00", one_time_payment_discount: "7500.00", syllabus: null, remarks: "" },
  { course_type: "course", name: "Bug Bounty & Web Security", full_amount: "20000.00", one_time_payment_discount: "5000.00", syllabus: null, remarks: "" },
  { course_type: "master_class", name: "Excel to Power BI", full_amount: "10000.00", one_time_payment_discount: null, syllabus: null, remarks: "" },
  { course_type: "master_class", name: "Stock Investing Guide: Fundamental to Technical Analysis", full_amount: "20000.00", one_time_payment_discount: null, syllabus: null, remarks: "" },
  { course_type: "master_class", name: "Content Creation Masterclass", full_amount: "12000.00", one_time_payment_discount: "2000.00", syllabus: null, remarks: "" },
  { course_type: "master_class", name: "Entrepreneurship & Business Finance", full_amount: "13000.00", one_time_payment_discount: null, syllabus: null, remarks: "" },
  { course_type: "master_class", name: "Nepal Startup Mastery: From Idea to Operation", full_amount: "18000.00", one_time_payment_discount: null, syllabus: null, remarks: "" },
  { course_type: "master_class", name: "Mastering Powerful Communication", full_amount: "13000.00", one_time_payment_discount: null, syllabus: null, remarks: "" },
  { course_type: "master_class", name: "Sell Like Crazy: The Ultimate Sales Mastery", full_amount: "5000.00", one_time_payment_discount: null, syllabus: null, remarks: "" },
  { course_type: "job_ready_program", name: "Full-Stack MERN Diploma Course (JRP)", full_amount: "108000.00", one_time_payment_discount: "18000.00", syllabus: null, remarks: "" },
  { course_type: "job_ready_program", name: "Data Science and Machine Learning Diploma Course (JRP)", full_amount: "108000.00", one_time_payment_discount: "18000.00", syllabus: null, remarks: "" },
  { course_type: "job_ready_program", name: "UI UX Design Diploma Course (JRP)", full_amount: "72000.00", one_time_payment_discount: "12000.00", syllabus: null, remarks: "" },
];

const BRANCHES: Branch[] = [
  { name: "Kathmandu Main", code: "KTM-MAIN", address: "Sankhamul, Kathmandu", phone: "01-XXXXXXX", email: "ktm@skillshikshya.com", is_active: true },
  { name: "Lalitpur", code: "LTP", address: "Lagankhel, Lalitpur", phone: "01-XXXXXXX", email: "ltp@skillshikshya.com", is_active: true },
  { name: "Bhaktapur", code: "BKT", address: "Suryabinayak, Bhaktapur", phone: "01-XXXXXXX", email: "bkt@skillshikshya.com", is_active: true },
];

const BATCHES: Batch[] = [
  { name: "Morning", description: "Morning time slot (6AM - 10AM)", is_active: true },
  { name: "Day", description: "Day time slot (10AM - 4PM)", is_active: true },
  { name: "Evening", description: "Evening time slot (4PM - 8PM)", is_active: true },
  { name: "Weekend", description: "Weekend time slot (Saturday/Sunday)", is_active: true },
  { name: "Flexible", description: "Flexible timing", is_active: true },
];

class SeedClient {
  private client: AxiosInstance;
  private cookieJar = new Map<string, string>();

  /** Store set-cookie headers from a response into the jar. */
  private storeCookies(headers: any) {
    const raw = headers?.["set-cookie"];
    if (!raw) return;
    for (const line of Array.isArray(raw) ? raw : [raw]) {
      const [pair] = String(line).split(";");
      const eq = pair.indexOf("=");
      if (eq > 0) this.cookieJar.set(pair.slice(0, eq).trim(), pair.slice(eq + 1).trim());
    }
  }

  /** Cookie header value from the jar. */
  private cookieHeader(): string {
    return [...this.cookieJar.entries()].map(([k, v]) => `${k}=${v}`).join("; ");
  }
  private leadTypeIdMap: Map<string, number> = new Map();
  private sourceIdMap: Map<string, number> = new Map();
  private statusIdMap: Map<string, number> = new Map();
  private priorityIdMap: Map<string, number> = new Map();
  private campaignIdMap: Map<string, number> = new Map();
  private courseIdMap: Map<string, number> = new Map();
  private branchIdMap: Map<string, number> = new Map();
  private batchIdMap: Map<string, number> = new Map();

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE,
      withCredentials: true,
      headers: { "Content-Type": "application/json" },
    });

    // Node has no cookie jar — attach our manually-managed cookies to every request
    // and capture any new cookies set by responses (login/refresh).
    this.client.interceptors.request.use((config) => {
      const cookie = this.cookieHeader();
      if (cookie) config.headers.Cookie = cookie;
      return config;
    });
    this.client.interceptors.response.use(
      (response) => {
        this.storeCookies(response.headers);
        return response;
      },
      (error) => {
        if (error.response) this.storeCookies(error.response.headers);
        const original = error.config;
        if (error.response?.status === 401 && original && !original._retried) {
          original._retried = true;
          return this.authenticate()
            .then(() => this.client.request(original));
        }
        return Promise.reject(error);
      }
    );
  }

  async authenticate() {
    console.log(`\n🔐 Authenticating as ${SEED_EMAIL}...`);
    try {
      await this.client.post("/auth/login/", {
        email: SEED_EMAIL,
        password: SEED_PASSWORD,
      });
      console.log("✅ Authentication successful");
    } catch (error: any) {
      if (error.response?.status === 400 || error.response?.status === 401) {
        const errData = error.response?.data;
        const msg = errData?.non_field_errors?.[0] || errData?.detail || errData?.message || "Invalid credentials";
        console.error(`\n❌ Authentication failed: ${msg}`);
        console.error("\n📝 Please create a superuser first using Django's management command:");
        console.error(`   docker compose exec backend python manage.py createsuperuser`);
        console.error("\n   Or if running locally:");
        console.error(`   python manage.py createsuperuser`);
        console.error(`\n   Then set SEED_EMAIL and SEED_PASSWORD in .env or environment variables.`);
        process.exit(1);
      } else {
        throw error;
      }
    }
  }

  async getOrCreate<T>(endpoint: string, items: T[], keyField: keyof T, idField: string = "id"): Promise<Map<string, number>> {
    const idMap = new Map<string, number>();

    for (const item of items) {
      const key = String(item[keyField]);
      try {
        const listResponse = await this.client.get(`${endpoint}?search=${encodeURIComponent(key)}`);
        const existing = listResponse.data.results.find((r: any) => r.name === key || (r.code && r.code === key));
        if (existing) {
          idMap.set(key, existing[idField]);
          console.log(`  ↳ "${key}" already exists (id: ${existing[idField]})`);
        } else {
          const createResponse = await this.client.post(endpoint, item);
          idMap.set(key, createResponse.data[idField]);
          console.log(`  ✅ Created "${key}" (id: ${createResponse.data[idField]})`);
        }
      } catch (error: any) {
        console.error(`  ❌ Failed to create "${key}":`, error.response?.data || error.message);
      }
    }
    return idMap;
  }

  async seedLeadTypes() {
    console.log("\n📋 Seeding Lead Types...");
    this.leadTypeIdMap = await this.getOrCreate("/lead-types/", LEAD_TYPES, "name");
  }

  async seedLeadSources() {
    console.log("\n📋 Seeding Lead Sources...");
    this.sourceIdMap = await this.getOrCreate("/lead-sources/", LEAD_SOURCES, "name");
  }

  async seedLeadStatuses() {
    console.log("\n📋 Seeding Lead Statuses...");
    this.statusIdMap = await this.getOrCreate("/lead-statuses/", LEAD_STATUSES, "name");
  }

  async seedLeadPriorities() {
    console.log("\n📋 Seeding Lead Priorities...");
    this.priorityIdMap = await this.getOrCreate("/lead-priorities/", LEAD_PRIORITIES, "name");
  }

  async seedCampaigns() {
    console.log("\n📋 Seeding Campaigns...");
    for (const campaign of CAMPAIGNS) {
      const key = campaign.name;
      try {
        const listResponse = await this.client.get(`/campaigns/?search=${encodeURIComponent(key)}`);
        const existing = listResponse.data.results.find((r: any) => r.name === key);
        if (existing) {
          this.campaignIdMap.set(key, existing.id);
          console.log(`  ↳ "${key}" already exists (id: ${existing.id})`);
        } else {
          const payload = { ...campaign };
          if (payload.source === null) {
            delete payload.source;
          }
          const createResponse = await this.client.post("/campaigns/", payload);
          this.campaignIdMap.set(key, createResponse.data.id);
          console.log(`  ✅ Created "${key}" (id: ${createResponse.data.id})`);
        }
      } catch (error: any) {
        console.error(`  ❌ Failed to create campaign "${key}":`, error.response?.data || error.message);
      }
    }
  }

  async seedCourses() {
    console.log("\n📋 Seeding Courses...");
    for (const course of COURSES) {
      const key = course.name;
      try {
        const listResponse = await this.client.get(`/courses/?search=${encodeURIComponent(key)}`);
        const existing = listResponse.data.results.find((r: any) => r.name === key);
        if (existing) {
          this.courseIdMap.set(key, existing.id);
          console.log(`  ↳ "${key}" already exists (id: ${existing.id})`);
        } else {
          const createResponse = await this.client.post("/courses/", course);
          this.courseIdMap.set(key, createResponse.data.id);
          console.log(`  ✅ Created "${key}" (id: ${createResponse.data.id})`);
        }
      } catch (error: any) {
        console.error(`  ❌ Failed to create course "${key}":`, error.response?.data || error.message);
      }
    }
  }

  async seedBranches() {
    console.log("\n📋 Seeding Branches...");
    for (const branch of BRANCHES) {
      const key = branch.name;
      try {
        const listResponse = await this.client.get(`/branches/?search=${encodeURIComponent(key)}`);
        const existing = listResponse.data.results.find((r: any) => r.name === key);
        if (existing) {
          this.branchIdMap.set(key, existing.id);
          console.log(`  ↳ "${key}" already exists (id: ${existing.id})`);
        } else {
          const createResponse = await this.client.post("/branches/", branch);
          this.branchIdMap.set(key, createResponse.data.id);
          console.log(`  ✅ Created "${key}" (id: ${createResponse.data.id})`);
        }
      } catch (error: any) {
        console.error(`  ❌ Failed to create branch "${key}":`, error.response?.data || error.message);
      }
    }
  }

  async seedBatches() {
    console.log("\n📋 Seeding Batches (Time Slots)...");
    for (const batch of BATCHES) {
      const key = batch.name;
      try {
        const listResponse = await this.client.get(`/batches/?search=${encodeURIComponent(key)}`);
        const existing = listResponse.data.results.find((r: any) => r.name === key);
        if (existing) {
          this.batchIdMap.set(key, existing.id);
          console.log(`  ↳ "${key}" already exists (id: ${existing.id})`);
        } else {
          const createResponse = await this.client.post("/batches/", batch);
          this.batchIdMap.set(key, createResponse.data.id);
          console.log(`  ✅ Created "${key}" (id: ${createResponse.data.id})`);
        }
      } catch (error: any) {
        console.error(`  ❌ Failed to create batch "${key}":`, error.response?.data || error.message);
      }
    }
  }

  async run() {
    console.log("🌱 Starting backend seed via API...");
    console.log(`📡 API Base: ${API_BASE}`);

    await this.authenticate();

    await this.seedLeadTypes();
    await this.seedLeadSources();
    await this.seedLeadStatuses();
    await this.seedLeadPriorities();
    await this.seedCampaigns();
    await this.seedCourses();
    await this.seedBranches();
    await this.seedBatches();

    console.log("\n✨ Seeding complete!");
    console.log("\n📊 Summary:");
    console.log(`   Lead Types: ${this.leadTypeIdMap.size}`);
    console.log(`   Lead Sources: ${this.sourceIdMap.size}`);
    console.log(`   Lead Statuses: ${this.statusIdMap.size}`);
    console.log(`   Lead Priorities: ${this.priorityIdMap.size}`);
    console.log(`   Campaigns: ${this.campaignIdMap.size}`);
    console.log(`   Courses: ${this.courseIdMap.size}`);
    console.log(`   Branches: ${this.branchIdMap.size}`);
    console.log(`   Batches: ${this.batchIdMap.size}`);
  }
}

const client = new SeedClient();
client.run().catch((error) => {
  console.error("\n💥 Seed failed:", error);
  process.exit(1);
});



