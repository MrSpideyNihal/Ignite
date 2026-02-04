// Seed script for initial data
// Run with: npm run seed

import mongoose from "mongoose";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env.local" });

const MONGODB_URI = process.env.MONGODB_URI;
const SUPER_ADMIN_EMAIL = process.env.SUPER_ADMIN_EMAIL || "admin@example.com";

if (!MONGODB_URI) {
    console.error("❌ MONGODB_URI is not defined");
    process.exit(1);
}

// Define schemas inline for seed script
const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    role: { type: String, default: "guest" },
    assignedTeams: [String],
}, { timestamps: true });

const EvaluationQuestionSchema = new mongoose.Schema({
    question: { type: String, required: true },
    description: String,
    maxScore: { type: Number, default: 10 },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });

const VenueInfoSchema = new mongoose.Schema({
    name: { type: String, required: true },
    address: { type: String, required: true },
    description: { type: String, required: true },
    facilities: [String],
    isActive: { type: Boolean, default: true },
}, { timestamps: true });

async function seed() {
    try {
        console.log("🌱 Starting seed...");

        await mongoose.connect(MONGODB_URI);
        console.log("✅ Connected to MongoDB");

        // Get or create models
        const User = mongoose.models.User || mongoose.model("User", UserSchema);
        const EvaluationQuestion = mongoose.models.EvaluationQuestion ||
            mongoose.model("EvaluationQuestion", EvaluationQuestionSchema);
        const VenueInfo = mongoose.models.VenueInfo ||
            mongoose.model("VenueInfo", VenueInfoSchema);

        // 1. Create Super Admin
        const existingAdmin = await User.findOne({ email: SUPER_ADMIN_EMAIL });
        if (!existingAdmin) {
            await User.create({
                email: SUPER_ADMIN_EMAIL,
                name: "Super Admin",
                role: "super_admin",
                assignedTeams: [],
            });
            console.log(`✅ Super admin created: ${SUPER_ADMIN_EMAIL}`);
        } else {
            console.log(`ℹ️  Super admin already exists: ${SUPER_ADMIN_EMAIL}`);
        }

        // 2. Create Evaluation Questions
        const questionsCount = await EvaluationQuestion.countDocuments({ isActive: true });
        if (questionsCount === 0) {
            const questions = [
                {
                    question: "Innovation & Creativity",
                    description: "How innovative and creative is the project idea?",
                    maxScore: 10,
                    order: 1,
                },
                {
                    question: "Technical Implementation",
                    description: "Quality of technical implementation and code",
                    maxScore: 10,
                    order: 2,
                },
                {
                    question: "Problem Solving",
                    description: "How well does the project solve the identified problem?",
                    maxScore: 10,
                    order: 3,
                },
                {
                    question: "Presentation & Demo",
                    description: "Quality of presentation and live demonstration",
                    maxScore: 10,
                    order: 4,
                },
                {
                    question: "Feasibility & Scalability",
                    description: "Is the project feasible and scalable for real-world use?",
                    maxScore: 10,
                    order: 5,
                },
                {
                    question: "Team Collaboration",
                    description: "Evidence of effective teamwork and collaboration",
                    maxScore: 10,
                    order: 6,
                },
            ];

            await EvaluationQuestion.insertMany(questions);
            console.log(`✅ Created ${questions.length} evaluation questions`);
        } else {
            console.log(`ℹ️  Evaluation questions already exist (${questionsCount})`);
        }

        // 3. Create Venue Info
        const venueCount = await VenueInfo.countDocuments({ isActive: true });
        if (venueCount === 0) {
            await VenueInfo.create({
                name: "Innovation Hub",
                address: "123 Technology Avenue, Innovation District, Tech Park",
                description: "State-of-the-art innovation center with modern facilities for tech events",
                facilities: [
                    "High-speed WiFi",
                    "Covered Parking",
                    "Cafeteria",
                    "Auditorium (500 seats)",
                    "Conference Rooms",
                    "Lab Spaces",
                    "Rest Rooms",
                    "First Aid Center",
                    "Charging Stations",
                ],
                isActive: true,
            });
            console.log("✅ Created venue info");
        } else {
            console.log("ℹ️  Venue info already exists");
        }

        console.log("\n🎉 Seed completed successfully!");
        console.log("\n📋 Summary:");
        console.log(`   - Super Admin: ${SUPER_ADMIN_EMAIL}`);
        console.log(`   - Login with Google using this email to access admin dashboard`);

    } catch (error) {
        console.error("❌ Seed error:", error);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
        console.log("\n👋 Disconnected from MongoDB");
    }
}

seed();
