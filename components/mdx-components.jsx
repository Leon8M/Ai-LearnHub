import Image from 'next/image';
import { Button } from '@/components/ui/button'; 
import Link from 'next/link';

export const customComponents = {
  h1: (props) => <h1 className="text-4xl font-bold my-6" {...props} />,
  h2: (props) => <h2 className="text-3xl font-semibold my-5 border-b pb-2 scroll-mt-20" id={props.children.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-*|-*$/g, '')} {...props} />, // Added ID for anchor links
  h3: (props) => <h3 className="text-2xl font-semibold my-4 scroll-mt-20" id={props.children.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-*|-*$/g, '')} {...props} />, // Added ID
  p: (props) => <p className="text-lg leading-relaxed my-4" {...props} />,
  a: (props) => <Link className="text-blue-600 hover:underline" {...props} />,
  ul: (props) => <ul className="list-disc pl-5 my-4" {...props} />,
  ol: (props) => <ol className="list-decimal pl-5 my-4" {...props} />,
  li: (props) => <li className="mb-2" {...props} />,
  img: (props) => <Image className="rounded-lg my-6" {...props} />,
};