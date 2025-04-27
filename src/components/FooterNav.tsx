"use client";

import Link from "next/link";

export default function FooterNav() {
  return (
    <nav className="bg-gray-100 p-4 border-t">
      <ul className="font-mono text-sm text-gray-700 space-y-1">
        <li>
          <Link href="/dashboard" className="hover:underline">
            📁 Dashboard
          </Link>
        </li>
            <li>
              <Link href="/resources" className="hover:underline">
                ├── Photo Gallery
              </Link>
            </li>
            <li>
              <Link href="/resources/videos" className="hover:underline">
                └── Video Library
              </Link>
            </li>
        <li>
          <Link href="/calendar" className="hover:underline">
            📅 Calendar
          </Link>
        </li>
            <li>
			  <Link href="/admin" className="hover:underline">
				📁 Admin
			  </Link>
			</li>
			<li>
			<Link href="/signin" className="hover:underline">
				├── Sign in
			</Link>
		 </li> 
		 <li>
			<Link href="register" className="hover:underline">
				├── Sign Up
			</Link>
		 </li>
			<li>
			  <Link href="/api/admin/users" className="hover:underline">
				├── DCC Users
			  </Link>
			</li>
			<li>
			  <Link href="/admin/users" className="hover:underline">
                ├── DCC User Management
              </Link>
            </li>
            <li>
              <Link href="/admin/audit" className="hover:underline">
                ├── Audit
              </Link>
            </li>
			<li>
			  <Link href="/api/admin/roles" className="hover:underline">
				└── Permissions	
			  </Link>
			</li>
			
         <li>
			<Link href="/newsletter/subscribe" className="hover:undelrine">
				📁 Newsletter
			</Link>
		 </li>
		 <li>
			<Link href="/admin/newsletter/send" className="hover:underline">
				├── Send Newsletter	
			</Link>
		 </li>
		<li>
			<Link href="/admin/newsletter/lists" className="hover:underline">
				├── Newsletter Lists
			</Link>
		 </li>
		 <li>
			<Link href="/admin/newsletter/subscribers" className="hover:underline">
				├── Newsletter Subscribers
			</Link>
		 </li>
		 <li>
			<Link href="/admin/newsletter/tags" className="hover:underline">
				├── Newsletter Tags	
			</Link>
		 </li> 
		 <li>
			<Link href="/newsletter/manage" className="hover:underline">
				└── Manage Subscriptions	
			</Link>
		 </li>
      </ul>
    </nav>
  );
}

