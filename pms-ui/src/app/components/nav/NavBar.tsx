'use client';
import {
  Navbar, 
  NavbarBrand, 
  NavbarContent, 
  NavbarItem, Link, Button
} from "@heroui/react";
import React from 'react';
import { FaHandshake } from "react-icons/fa6";
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';

const NavBar = () => {
    const router = useRouter();

    const handleLogout = () => {
        Cookies.remove('access_token', { path: '/' }); // Remove the cookie
        router.push('/'); // Redirect to home/login page
    };

    return (
        <Navbar maxWidth="full" className="fixed shadow-lg bg-secondary shadow-lg">
      <NavbarBrand className="gap-2">
        <FaHandshake size={30} color="white" />
        <p className="font-bold text-white text-3xl text-shadow-md gap-2">PMS</p>
      </NavbarBrand>
      <NavbarContent className="flex gap-4" justify="center">
        <NavbarItem>
          <Button 
            className="text-white" 
            variant="light"
            onClick={handleLogout}
          >
            Logout
          </Button>
        </NavbarItem>
        <NavbarItem >
          <Link className="text-white" href="/about">
            About
          </Link>
        </NavbarItem>
        <NavbarItem>
          <Link className="text-white" href="/contact">
            Contact us
          </Link>
        </NavbarItem>
      </NavbarContent>
      </Navbar>
    );
};

export default NavBar;

