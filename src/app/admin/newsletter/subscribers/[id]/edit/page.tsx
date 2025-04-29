"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

type Subscriber = {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  lists: { id: string; name: string }[];
  tags: { id: string; name: string }[];
};

type List = { id: string; name: string };
type Tag = { id: string; name: string };

export default function EditSubscriberPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { id } = params;

  const [subscriber, setSubscriber] = useState<Subscriber | null>(null);
  const [lists, setLists] = useState<List[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedListIds, setSelectedListIds] = useState<string[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const subRes = await fetch(`/api/admin/newsletter/subscribers/${id}`);
        const subData = await subRes.json();
        setSubscriber(subData);
        setEmail(subData.email || "");
        setName(subData.name || "");
        setPhone(subData.phone || "");
        setSelectedListIds(subData.lists.map((l: any) => l.id));
        setSelectedTagIds(subData.tags.map((t: any) => t.id));

        const listsRes = await fetch("/api/newsletter/lists");
        setLists(await listsRes.json());

        const tagsRes = await fetch("/api/newsletter/tags");
        setTags(await tagsRes.json());
      } catch (err) {
        toast.error("Failed to load subscriber data");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [id]);

  const toggleList = (listId: string) => {
    setSelectedListIds((prev) =>
      prev.includes(listId) ? prev.filter((id) => id !== listId) : [...prev, listId]
    );
  };

  const toggleTag = (tagId: string) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  };

  const saveChanges = async () => {
    try {
      const res = await fetch(`/api/admin/newsletter/subscribers/${id}/edit`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name, phone, listIds: selectedListIds, tagIds: selectedTagIds }),
      });

      if (res.ok) {
        toast.success("Subscriber updated!");
        router.push("/admin/newsletter/subscribers");
      } else {
        throw new Error("Update failed");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to update subscriber");
    }
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  if (!subscriber) {
    return <div className="p-6 text-red-600">Subscriber not found</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold mb-4">Edit Subscriber</h1>

      {/* Info fields */}
      <div className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">Email</label>
          <input
            type="email"
            className="border p-2 w-full"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Name</label>
          <input
            type="text"
            className="border p-2 w-full"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Phone</label>
          <input
            type="text"
            className="border p-2 w-full"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
      </div>

      {/* List and Tag checkboxes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-lg font-semibold mb-2">Lists</h2>
          <div className="space-y-2">
            {lists.map((list) => (
              <label key={list.id} className="block">
                <input
                  type="checkbox"
                  className="mr-2"
                  checked={selectedListIds.includes(list.id)}
                  onChange={() => toggleList(list.id)}
                />
                {list.name}
              </label>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2">Tags</h2>
          <div className="space-y-2">
            {tags.map((tag) => (
              <label key={tag.id} className="block">
                <input
                  type="checkbox"
                  className="mr-2"
                  checked={selectedTagIds.includes(tag.id)}
                  onChange={() => toggleTag(tag.id)}
                />
                {tag.name}
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Save button */}
      <button
        onClick={saveChanges}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Save Changes
      </button>
    </div>
  );
}

