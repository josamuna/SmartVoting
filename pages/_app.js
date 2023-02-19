import "@styles/globals.css";
import { useState, useEffect } from "react";
import {
  Navbar,
  MobileNav,
  Typography,
  Button,
  IconButton,
} from "@material-tailwind/react";
import Link from "next/link";

function SmartVoting({ Component, pageProps }) {
  const [openNav, setOpenNav] = useState(false);

  useEffect(() => {
    window.addEventListener(
      "resize",
      () => window.innerWidth >= 960 && setOpenNav(false)
    );
  }, []);

  const navList = (
    <ul className="mb-4 mt-2 flex flex-col gap-2 lg:mb-0 lg:mt-0 lg:flex-row lg:items-center lg:gap-6">
      <Typography
        as="li"
        variant="small"
        color="blue-gray"
        className="p-1 font-normal text-purple-800 hover:text-orange-700"
      >
        <Link href="castVote" className="flex items-center">
          Cast Vote
        </Link>
      </Typography>
      <Typography
        as="li"
        variant="small"
        color="blue-gray"
        className="p-1 font-normal text-purple-900 hover:text-orange-700"
      >
        <Link href="voteType" className="flex items-center">
          Vote type
        </Link>
      </Typography>
      <Typography
        as="li"
        variant="small"
        color="blue-gray"
        className="p-1 font-normal text-purple-900 hover:text-orange-700"
      >
        <Link href="votingOffice" className="flex items-center">
          Voting Office
        </Link>
      </Typography>
      <Typography
        as="li"
        variant="small"
        color="blue-gray"
        className="p-1 font-normal text-purple-900 hover:text-orange-700"
      >
        <Link href="vote" className="flex items-center">
          Vote
        </Link>
      </Typography>
      <Typography
        as="li"
        variant="small"
        color="blue-gray"
        className="p-1 font-normal text-purple-900 hover:text-orange-700"
      >
        <Link href="candidates" className="flex items-center">
          Candidates
        </Link>
      </Typography>
      <Typography
        as="li"
        variant="small"
        color="blue-gray"
        className="p-1 font-normal text-purple-900 hover:text-orange-700"
      >
        <Link href="witnesses" className="flex items-center">
          Witnesses
        </Link>
      </Typography>
      <Typography
        as="li"
        variant="small"
        color="blue-gray"
        className="p-1 font-normal text-purple-900 hover:text-orange-700"
      >
        <Link href="voters" className="flex items-center">
          Voters
        </Link>
      </Typography>
      <Typography
        as="li"
        variant="small"
        color="blue-gray"
        className="p-1 font-normal text-purple-900 hover:text-orange-700"
      >
        <Link href="/votingResults" className="flex items-center">
          Voting Results
        </Link>
      </Typography>
    </ul>
  );

  return (
    <main>
      <section className="bg-gradient-to-b from-purple-300 to to-orange-100">
        <Navbar className="mx-auto max-w-screen-xl py-2 px-4 lg:px-8 lg:py-4">
          <div className="container mx-auto flex items-center justify-between text-blue-gray-900">
            <Typography
              href="/"
              className="mr-4 cursor-pointer py-1.5 font-semibold text-lg text-blue-800 hover:text-purple-700"
            >
              <Link href="/">
                <span>Smart Voting Application</span>
              </Link>
            </Typography>
            <div className="hidden lg:block">{navList}</div>
            <Button
              variant="gradient"
              size="sm"
              className="hidden lg:inline-block"
            >
              <Link href="/login">
                <span className="font-normal text-purple-800 hover:text-orange-800">
                  Login
                </span>
              </Link>
            </Button>
            <IconButton
              variant="text"
              className="ml-auto h-6 w-6 text-inherit hover:bg-transparent focus:bg-transparent active:bg-transparent lg:hidden"
              ripple={false}
              onClick={() => setOpenNav(!openNav)}
            >
              {openNav ? (
                <svg
                  xmlns="https://www.w3.org/TR/SVG/"
                  fill="none"
                  className="h-6 w-6"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="https://www.w3.org/TR/SVG/"
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </IconButton>
          </div>
          <MobileNav open={openNav}>
            <div className="container mx-auto">
              {navList}
              <Button variant="gradient" size="sm" fullWidth className="mb-2">
                <span>Login</span>
              </Button>
            </div>
          </MobileNav>
        </Navbar>
      </section>
      <Component {...pageProps} />
    </main>
  );
}

export default SmartVoting;
