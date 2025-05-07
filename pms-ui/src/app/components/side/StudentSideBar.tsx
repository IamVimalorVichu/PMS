'use client'; // Required because we use hooks

import React from 'react'; // Removed useState, useEffect
import {
  Navbar,
  NavbarContent,
  NavbarItem,
  Link
} from "@heroui/react";
import { IoDocuments } from "react-icons/io5";
import { CgProfile, CgPerformance } from "react-icons/cg";
import { IoMdListBox } from "react-icons/io";
import { GrSchedulePlay } from "react-icons/gr";
import { RiUserCommunityFill } from "react-icons/ri";

// --- Import the hook that provides the student data ---
import { useStudentManagement } from '@/app/students/components/useStudentManagement'; // Adjust path if needed

// --- Removed fetchStudentByIdAPI definition/import ---

const StudentSidebar = () => {
  // --- Get student object and loading state from the central hook ---
  // 'student' will be null until fetched, 'loading' indicates if the initial student fetch is happening
  const { student, loading: isStudentLoading } = useStudentManagement();

  // --- Extract the student's _id directly from the student object ---
  const studentId = student?._id;

  // --- Removed internal state (studentId, isStudentLoading, fetchError) and useEffect ---

  // Construct the dynamic href using the studentId from the hook
  const performanceHref = studentId ? `/students/performance/${studentId}` : '#';

  // Determine the link's state based on the hook's loading status and student availability
  const linkIsLoading = isStudentLoading; // Use the loading state from the hook

  return (
    <Navbar className="top-16 shadow-lg bg-secondary h-screen w-48 flex flex-col fixed left-0 z-10 justify-start pt-4">
      <NavbarContent className="items-start flex flex-col gap-4 w-full">
        {/* --- Other Navbar Items --- */}
        <NavbarItem className="w-full">
          <Link href="/students/profile"><div className="flex text-white items-center text-lg gap-2 hover:text-black"><CgProfile />Profile</div></Link>
        </NavbarItem>
        <NavbarItem className="w-full">
          <Link href="/students/notice"><div className="flex items-center text-white text-lg hover:text-black gap-2"><IoMdListBox />Notice</div></Link>
        </NavbarItem>
        <NavbarItem className="w-full">
          <Link href="/students/drives"><div className="flex items-center gap-2 text-white text-lg hover:text-black"><GrSchedulePlay />Drives</div></Link>
        </NavbarItem>
        <NavbarItem className="w-full">
          <Link href="/students/resumes"><div className="flex items-center gap-2 text-white text-lg hover:text-black"><IoDocuments />Resumes</div></Link>
        </NavbarItem>
        <NavbarItem className="w-full">
          <Link href="/community"><div className="flex items-center gap-2 text-white text-lg hover:text-black"><RiUserCommunityFill />Community</div></Link>
        </NavbarItem>

        {/* --- Performance Link --- */}
        <NavbarItem className="w-full">
          {linkIsLoading ? (
            // Show loading state while useStudentManagement is fetching the student
            <div className="flex items-center gap-2 text-gray-400 text-lg cursor-wait"><CgPerformance />Performance</div>
          ) : studentId ? (
            // Render the link if studentId is available from the hook's state
            <Link href={performanceHref}><div className="flex items-center gap-2 text-white text-lg hover:text-black"><CgPerformance />Performance</div></Link>
          ) : (
             // Show disabled state if loading finished but no studentId (e.g., user not linked to student profile)
             <div className="flex items-center gap-2 text-gray-400 text-lg cursor-not-allowed" title={"Student profile not linked or found"}><CgPerformance />Performance</div>
          )}
        </NavbarItem>
      </NavbarContent>
    </Navbar>
  );
};

export default StudentSidebar;