'use client'

import { useRouter } from "next/navigation";

const NavButton = () => {
    const router = useRouter();
    return (
        <button
            onClick={() => {
                router.push("/");
            }}
        >
            Take me home
        </button>
    );
}

export default NavButton;