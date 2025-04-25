from fastapi import APIRouter, HTTPException, status, Query
from typing import List

from pms.models.post import PostCreate, PostRead, VoteStatus, VoteResult
from pms.models.report import ReportCreate, ReportRead
from pms.services.report_services import report_mgr
from pms.services.post_services import post_mgr

router = APIRouter()

@router.post("/create/{reporter_id}", status_code=status.HTTP_201_CREATED)
async def create_report(report_data: ReportCreate, reporter_id: str):
    """
    Creates a new report for a post or comment.
    """
    try:
        result = await report_mgr.create_report(report_data, reporter_id)
        return result
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail="Failed to create report."
        )

@router.get("/get", response_model=List[ReportRead])
async def list_reports(
    skip: int = 0,
    limit: int = Query(default=20, le=100)
):
    """
    Retrieves a list of reports.
    """
    try:
        reports = await report_mgr.get_reports(skip=skip, limit=limit)
        return reports
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail="Failed to retrieve reports."
        )

@router.get("/get/{report_id}", response_model=ReportRead)
async def get_report(report_id: str):
    """
    Retrieves a single report by ID.
    """
    try:
        report = await report_mgr.get_report_by_id(report_id)
        if not report:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Report not found."
            )
        return report
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve report."
        )