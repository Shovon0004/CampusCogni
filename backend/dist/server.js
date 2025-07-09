"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
// Import routes
const auth_1 = __importDefault(require("./routes/auth"));
const students_1 = __importDefault(require("./routes/students"));
const recruiters_1 = __importDefault(require("./routes/recruiters"));
const jobs_1 = __importDefault(require("./routes/jobs"));
const applications_1 = __importDefault(require("./routes/applications"));
const upload_1 = __importDefault(require("./routes/upload"));
const notifications_1 = __importDefault(require("./routes/notifications"));
// Load environment variables
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
}));
app.use((0, morgan_1.default)('combined'));
app.use(express_1.default.json({ limit: '50mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '50mb' }));
// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});
// API Routes
app.use('/api/auth', auth_1.default);
app.use('/api/students', students_1.default);
app.use('/api/recruiters', recruiters_1.default);
app.use('/api/jobs', jobs_1.default);
app.use('/api/applications', applications_1.default);
app.use('/api/upload', upload_1.default);
app.use('/api/notifications', notifications_1.default);
// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});
// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
});
exports.default = app;
//# sourceMappingURL=server.js.map