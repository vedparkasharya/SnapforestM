import { redirect } from "next/navigation";

export default function BookRedirectPage({ params }: { params: { slug: string } }) {
  redirect(`/rooms/${params.slug}`);
}
