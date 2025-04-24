"use client";

import Link from "next/link";

export default function FooterNav() {
  return (
    <nav className="bg-gray-100 p-4 border-t">
      <ul className="font-mono text-sm text-gray-700 space-y-1">
        <li>
          <Link href="/dashboard" className="hover:underline">
            📁 dashboard
          </Link>
        </li>

        <li>
          library
          <ul className="pl-4 space-y-1">
            <li>
              <Link href="/resources" className="hover:underline">
                ├── photo-gallery
              </Link>
            </li>
            <li>
              <Link href="/resources/videos" className="hover:underline">
                └── video-library
              </Link>
            </li>
          </ul>
        </li>

        <li>
          <Link href="/calendar" className="hover:underline">
            📅 calendar
          </Link>
        </li>

            <li>
			  <Link href="/admin" className="hover:underline">
				Admin
			  </Link>
			</li>
			<li>
			  <Link href="/admin/users" className="hover:underline">
                ├── users
              </Link>
            </li>
            <li>
              <Link href="/admin/audit" className="hover:underline">
                └── audit
              </Link>
            </li>
         <li>
			<Link href="/signin" className="hover:underline">
				Sign in
			</Link>
		 </li> 
		 <li>
			<Link href="register" className="hover:underline">
				Sign Up
			</Link>
		 </li>
      </ul>
    </nav>
  );
}

