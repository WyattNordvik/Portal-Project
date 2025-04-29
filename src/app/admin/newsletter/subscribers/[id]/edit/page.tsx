"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

type Tag = { id: string; name: string };
type List = { id: string; name: string };
type Subscriber = {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  lists: List[];
  tags: Tag[];
};

export default function EditSubscriberPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { id } = use(params);

  const [subscriber, setSubscriber] = useState<Subscriber | null>(null);
  const [lists, setLists] = useState<List[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [subRes, listsRes, tagsRes] = await Promise.all([
          fetch(`/api/admin/newsletter/subscribers/${id}`),
          fetch("/api/newsletter/lists"),
          fetch("/api/newsletter/tags"),
        ]);

        if (!subRes.ok) throw new Error("Failed to fetch subscriber");

        const subData = await subRes.json();
        const listsData = await listsRes.json();
        const tagsData = await tagsRes.json();

        // 🔥 Fix: transform the subscriber's lists/tags into the correct format
        setSubscriber({
          id: subData.id,
          email: subData.email,
          name: subData.name,
          phone: subData.phone,
          lists: subData.lists.map((l: any) => ({ id: l.id, name: l.name })),
          tags: subData.tags.map((t: any) => ({ id: t.id, name: t.name })),
        });

        setLists(listsData);
        setTags(tagsData);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [id]);

  async function save() {
    if (!subscriber) return;

    try {
      const res = await fetch(`/api/admin/newsletter/subscribers/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subscriber),
      });

      if (res.ok) {
        toast.success("Subscriber updated");
        router.push("/admin/newsletter/subscribers");
      } else {
        throw new Error();
      }
    } catch (err) {
      toast.error("Failed to save subscriber");
    }
  }

  if (loading) return <div className="p-6">Loading...</div>;
  if (!subscriber) return <div className="p-6">No subscriber found.</div>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold mb-4">Edit Subscriber</h1>

      <div className="space-y-4">
        {/* Name */}
        <div>
          <label className="block mb-1 font-medium">Name</label>
          <input
            type="text"
            value={subscriber.name || ""}
            onChange={(e) => setSubscriber({ ...subscriber, name: e.target.value })}
            className="border p-2 w-full"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block mb-1 font-medium">Email</label>
          <input
            type="email"
            value={subscriber.email}
            onChange={(e) => setSubscriber({ ...subscriber, email: e.target.value })}
            className="border p-2 w-full"
          />
        </div>

        {/* Phone */}
        <div>
          <label className="block mb-1 font-medium">Phone</label>
          <input
            type="text"
            value={subscriber.phone || ""}
            onChange={(e) => setSubscriber({ ...subscriber, phone: e.target.value })}
            className="border p-2 w-full"
          />
        </div>

        {/* Lists */}
        <div>
          <label className="block mb-1 font-medium">Lists</label>
          <div className="flex flex-wrap gap-2">
            {lists.map((list) => {
              const selected = subscriber.lists.some((l) => l.id === list.id);
              return (
                <button
                  key={list.id}
                  onClick={() => {
                    setSubscriber({
                      ...subscriber,
                      lists: selected
                        ? subscriber.lists.filter((l) => l.id !== list.id)
                        : [...subscriber.lists, list],
                    });
                  }}
                  className={`px-3 py-1 rounded-full border ${
                    selected
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {list.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="block mb-1 font-medium">Tags</label>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => {
              const selected = subscriber.tags.some((t) => t.id === tag.id);
              return (
                <button
                  key={tag.id}
                  onClick={() => {
                    setSubscriber({
                      ...subscriber,
                      tags: selected
                        ? subscriber.tags.filter((t) => t.id !== tag.id)
                        : [...subscriber.tags, tag],
                    });
                  }}
                  className={`px-3 py-1 rounded-full border ${
                    selected
                      ? "bg-green-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {tag.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={save}
          className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}
