from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.jobstores.mongodb import MongoDBJobStore
from datetime import datetime
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import MongoClient
from pms.db.database import DatabaseConnection
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Move wrapper function to module level
def clear_restrictions_wrapper(user_id: str):
    """Synchronous wrapper to clear user restrictions"""
    try:
        loop = asyncio.get_event_loop()
        from pms.services.user_services import user_mgr
        loop.run_until_complete(user_mgr._clear_restrictions(user_id))
        logger.info(f"Successfully cleared restrictions for user {user_id}")
    except Exception as e:
        logger.error(f"Failed to clear restrictions for user {user_id}: {e}")

class SchedulerMgr:
    def __init__(self):
        self.scheduler = None
        self.db = None
        self.jobstore = None

    async def initialize(self):
        try:
            self.db = DatabaseConnection()
            mongodb = await self.db.get_database()
            
            # Create a sync MongoDB client for APScheduler
            # APScheduler doesn't support async MongoDB drivers
            sync_client = MongoClient(self.db.database_url)
            sync_db = sync_client[self.db.database_name]

            # Create MongoDB job store with sync client
            self.jobstore = MongoDBJobStore(
                database=self.db.database_name,
                collection='scheduler_jobs',
                client=sync_client  # Use sync client instead of async
            )

            # Initialize scheduler with MongoDB jobstore
            self.scheduler = AsyncIOScheduler(
                jobstores={
                    'default': self.jobstore
                }
            )
            
            # Start the scheduler
            self.scheduler.start()
            logger.info("Scheduler started with MongoDB jobstore")

        except Exception as e:
            logger.error(f"Failed to initialize scheduler: {e}")
            raise

    async def schedule_restriction_clear(self, user_id: str, run_date: datetime):
        """Schedule a job to clear user restrictions at the specified date/time"""
        try:
            job_id = f"clear_restrictions_{user_id}"
            
            # Remove any existing job for this user
            try:
                self.scheduler.remove_job(job_id)
            except:
                pass

            # Add new job using module-level function reference
            self.scheduler.add_job(
                'pms.services.scheduler_services:clear_restrictions_wrapper',
                'date',
                run_date=run_date,
                id=job_id,
                name=f"Clear restrictions for user {user_id}",
                args=[user_id],
                replace_existing=True,
                misfire_grace_time=3600
            )
            logger.info(f"Scheduled restriction clear for user {user_id} at {run_date}")

        except Exception as e:
            logger.error(f"Failed to schedule restriction clear for user {user_id}: {e}")
            raise

scheduler_mgr = SchedulerMgr()