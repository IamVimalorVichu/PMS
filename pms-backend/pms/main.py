from contextlib import asynccontextmanager
from fastapi import FastAPI, Response
from fastapi.staticfiles import StaticFiles
from pms.db.database import DatabaseConnection
from pms.services.student_services import student_mgr
from pms.services.company_services import company_mgr
from pms.services.drive_services import drive_mgr
from pms.services.job_services import job_mgr
from pms.services.drivecompany_services import drive_company_mgr
from pms.services.user_services import user_mgr
from pms.services.student_performance_services import student_performance_mgr
from pms.services.faculty_services import faculty_mgr
from pms.routes.user import router as userRouter
from pms.routes.student import router as studentRouter
from pms.routes.company import router as companyRouter
from pms.routes.drive_company import router as driveCompanyRouter
from pms.routes.job import router as jobRouter
from pms.routes.drive import router as driveRouter
from pms.routes.auth import router as authRouter
from pms.routes.faculty import router as facultyRouter
from pms.routes.student_performance import router as studentPerformanceRouter
from pms.routes.requirement import router as requirementRouter
from pms.services.requirement_services import requirement_mgr
from pms.routes.jobapplication import router as jobApplicationRouter
from pms.services.jobapplication_services import jobapplication_mgr
from pms.routes.uploads import router as uploadRouter
from fastapi.middleware.cors import CORSMiddleware
from pms.core.config import config
from pms.routes.resume import router as resumeRouter
from pms.services.resume_services import resume_mgr
from pms.routes.alumni import router as alumniRouter
from pms.services.alumni_services import alumni_mgr
from pms.routes.drive_form import router as drive_form_router
from pms.routes.application_form import router as application_form_router
from pms.services.drive_form_services import drive_form_mgr
from pms.services.application_form_services import application_form_mgr
from pms.services.post_services import post_mgr
from pms.services.comment_services import comment_mgr
from pms.services.report_services import report_mgr
from pms.services.direct_message_services import dm_mgr
from pms.routes.post_routes import router as post_router
from pms.routes.report_routes import router as report_router
from pms.routes.admin_community_routes import router as admin_community_router
from pms.routes.direct_message_routes import router as dm_router


origins = [
    "http://localhost:3000",  # Adjust this if your frontend runs on a different port
    "http://fictional-yodel-x77wwxg7pjhv4rw-3000.app.github.dev",  # Add frontend URL
    "https://fictional-yodel-x77wwxg7pjhv4rw-3000.app.github.dev",
    "http://fictional-yodel-x77wwxg7pjhv4rw-3001.app.github.dev",
    "https://fictional-yodel-x77wwxg7pjhv4rw-3001.app.github.dev",
    "http://bookish-guide-5g5p4jxvg7jwhpv76-3000.app.github.dev",
    "https://bookish-guide-5g5p4jxvg7jwhpv76-3000.app.github.dev",
    "http://bookish-guide-5g5p4jxvg7jwhpv76-3001.app.github.dev",
    "https://bookish-guide-5g5p4jxvg7jwhpv76-3001.app.github.dev",
]

db = DatabaseConnection()
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await db.connect()
    await user_mgr.initialize()
    await student_mgr.initialize()
    await company_mgr.initialize()
    await drive_mgr.initialize()
    await job_mgr.initialize()
    await drive_company_mgr.initialize()
    await student_performance_mgr.initialize()
    await faculty_mgr.initialize()
    await requirement_mgr.initialize()
    await jobapplication_mgr.initialize()
    await resume_mgr.initialize()
    await alumni_mgr.initialize()
    await drive_form_mgr.initialize()
    await application_form_mgr.initialize()
    await post_mgr.initialize()
    await comment_mgr.initialize()
    await report_mgr.initialize()
    await dm_mgr.initialize()
    yield
    # Shutdown
    await db.close()

app = FastAPI(lifespan=lifespan)


@app.options("/{path:path}")
async def options_handler(path: str):
    return Response()

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods (GET, POST, OPTIONS, etc.)
    allow_headers=["*"],  # Allow all headers
)

app.include_router(authRouter, tags=["Auth"], prefix="/auth")
app.include_router(userRouter, tags=["User"], prefix="/user")
app.include_router(studentRouter, tags=["Student"], prefix="/student")
app.include_router(driveRouter, tags=["Drive"], prefix="/drive")
app.include_router(companyRouter, tags=["Company"], prefix="/company")
app.include_router(driveCompanyRouter, tags=["Drive to Company"], prefix="/drive_company")
app.include_router(jobRouter, tags=["Job"], prefix="/job")
app.include_router(studentPerformanceRouter, tags=["Student Performance"], prefix="/student-performance")
app.include_router(facultyRouter, tags=["Faculty"], prefix="/faculty")
app.include_router(requirementRouter, tags=["Job Requirements"], prefix="/requirements")
app.include_router(jobApplicationRouter, tags=["Job Applications"], prefix="/job-applications")
app.include_router(uploadRouter, tags=["Uploads"], prefix="/uploads")
app.include_router(resumeRouter, tags=["Resume"], prefix="/resume")
app.include_router(alumniRouter, tags=["Alumni"], prefix="/alumni")
app.include_router(drive_form_router, prefix="/drive-forms", tags=["Drive Forms"])
app.include_router(application_form_router,prefix="/applications-form",tags=["Application Forms"])
app.include_router(post_router, prefix="/community", tags=["Posts"])
app.include_router(report_router, prefix="/reports", tags=["Reports"])
app.include_router(admin_community_router, prefix="/admin/community", tags=["Admin Community Management"])
app.include_router(dm_router, prefix="/direct-messages", tags=["Direct Messages"])
app.mount("/uploads", StaticFiles(directory=config.UPLOAD_DIR), name="uploads")


