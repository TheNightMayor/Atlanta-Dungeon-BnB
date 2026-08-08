'use client';

import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

const defaultFormData = {
  email: '',
  name: '',
  topic: '',
  text: '',
};

const ContactClient = () => {
  const [formData, setFormData] = useState(defaultFormData);
  const inputStyles = "form-input";
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!session) router.push("/auth");
    else {
      setFormData(f => ({
        ...f,
        email: session.user?.email || '',
        name: session.user?.name || '',
      }));
    }

    const topicParam = searchParams.get('topic');
    if (topicParam) {
      setFormData(f => ({ ...f, topic: topicParam }));
    }
  }, [router, session, searchParams]);

  const handleInputChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!session?.user) {
      toast.error('You must be logged in to send a message.');
      return;
    }
    try {
      const response = await fetch(`/api/user-messages/${session.user.email}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          userId: session.user.email,
        }),
      });

      if (response.ok) {
        toast.success('Message sent!');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Something went wrong');
      }
    } catch (error) {
      toast.error('Something went wrong');
    } finally {
      setFormData(defaultFormData);
    }
  };

  return (
    <section className="container mx-auto pt-2 md:pt-2">
      <div className="p-6 space-y-4 md:space-y-6 sm:p-8 w-80 md:w-[70%] mx-auto">
        <div className="flex mb-8 flex-col md:flex-row items-center justify-between">
          <h1 className="text-ex font-bold leading-tight tracking-tight md:text-2xl">
            Send us a message
          </h1>
        </div>

        <form className="space-y-4 md:space-y-6" onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Jane Doe"
            required
            className={inputStyles}
            value={formData.name}
            onChange={handleInputChange}
          />
          <input
            type="email"
            name="email"
            value={formData.email}
            placeholder="name@company.com"
            required
            className={inputStyles}
            onChange={handleInputChange}
          />
          <input
            type="text"
            name="topic"
            value={formData.topic}
            placeholder="Topic"
            required
            minLength={6}
            className={inputStyles}
            onChange={handleInputChange}
          />
          <textarea
            name="text"
            value={formData.text}
            placeholder="Your message"
            required
            minLength={10}
            className={inputStyles}
            onChange={handleInputChange}
            rows={6}
          />

          <button
            type="submit"
            className="btn-tertiary-solid"
          >
            Send Message
          </button>
        </form>
      </div>
    </section>
  );
};

export default ContactClient;
