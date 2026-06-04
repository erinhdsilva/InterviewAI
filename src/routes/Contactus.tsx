import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  MapPin,
  Mail,
  Phone,
  Loader2,
  // Twitter,
  // Github,
  // Linkedin
} from 'lucide-react';

// 1️⃣ Define and infer schema
const ContactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z
    .string()
    .optional()
    .refine(val => !val || /^[0-9()+-\s]+$/.test(val), 'Invalid phone number'),
  subject: z.string().min(5, 'Subject must be at least 5 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters')
});
type ContactData = z.infer<typeof ContactSchema>;

const ContactUsPage: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isSubmitSuccessful }
  } = useForm<ContactData>({
    resolver: zodResolver(ContactSchema)
  });

  const onSubmit = async (data: ContactData) => {
    try {
      // TODO: replace with your real API endpoint
      await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Contact Info + Map */}
        <div className="space-y-8">
          <h2 className="text-3xl font-extrabold text-gray-900">
            Get in Touch
          </h2>
          <p className="text-gray-600">
            Have questions? Fill out the form and we will get back to you as soon
            as possible.
          </p>

          <div className="space-y-6">
            <div className="flex items-start">
              <MapPin className="w-6 h-6 text-indigo-600 mt-1" />
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Our Address
                </h3>
                <p className="text-gray-600">
  IIIT Lucknow
  <br />
  Chak Ganjaria, C. G. City
  <br />
  Uttar Pradesh 226002
  <br />
  India
</p>
              </div>
            </div>

            <div className="flex items-start">
              <Mail className="w-6 h-6 text-indigo-600 mt-1" />
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Email Us</h3>
               <p className="text-gray-600">
  lcb2023026@iiitl.ac.in
</p>
              </div>
            </div>

            <div className="flex items-start">
              <Phone className="w-6 h-6 text-indigo-600 mt-1" />
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Call Us
                </h3>
                <p className="text-gray-600">+91 9569842073</p>
              </div>
            </div>

            {/* <div className="flex space-x-4 pt-4"> */}
              {/* <a href="#" className="hover:text-indigo-600">
                <Twitter />
              </a>
              <a href="#" className="hover:text-indigo-600">
                <Github />
              </a>
              <a href="#" className="hover:text-indigo-600">
                <Linkedin />
              </a> */}
            {/* </div> */}
          </div>

          {/* Embedded Map */}
          <div className="w-full h-64 rounded-lg overflow-hidden">
            <iframe
  src="https://maps.google.com/maps?q=IIIT%20Lucknow&t=&z=15&ie=UTF8&iwloc=&output=embed"
  className="w-full h-full"
  allowFullScreen
  loading="lazy"
/>
          </div>
        </div>

        {/* Contact Form */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white p-8 shadow-lg rounded-lg space-y-6"
        >
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              type="text"
              {...register('name')}
              className={
                `mt-1 w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500` +
                (errors.name ? ' border-red-500' : ' border-gray-300')
              }
              placeholder="Your full name"
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              id="email"
              type="email"
              {...register('email')}
              className={
                `mt-1 w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500` +
                (errors.email ? ' border-red-500' : ' border-gray-300')
              }
              placeholder="you@example.com"
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
              Phone
            </label>
            <input
              id="phone"
              type="tel"
              {...register('phone')}
              className={
                `mt-1 w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500` +
                (errors.phone ? ' border-red-500' : ' border-gray-300')
              }
              placeholder="Optional phone number"
            />
            {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>}
          </div>

          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
              Subject <span className="text-red-500">*</span>
            </label>
            <input
              id="subject"
              type="text"
              {...register('subject')}
              className={
                `mt-1 w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500` +
                (errors.subject ? ' border-red-500' : ' border-gray-300')
              }
              placeholder="What's this about?"
            />
            {errors.subject && <p className="text-red-500 text-sm mt-1">{errors.subject.message}</p>}
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700">
              Message <span className="text-red-500">*</span>
            </label>
            <textarea
              id="message"
              rows={5}
              {...register('message')}
              className={
                `mt-1 w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500` +
                (errors.message ? ' border-red-500' : ' border-gray-300')
              }
              placeholder="Tell us more..."
            />
            {errors.message && <p className="text-red-500 text-sm mt-1">{errors.message.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex justify-center items-center py-3 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 transition disabled:opacity-50"
          >
            {isSubmitting ? <Loader2 className="animate-spin w-5 h-5 mr-2" /> : null}
            {isSubmitting ? 'Sending...' : isSubmitSuccessful ? 'Sent!' : 'Send Message'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ContactUsPage;