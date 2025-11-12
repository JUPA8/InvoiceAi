import { ReactNode } from "react";

interface ItemFeatureProps {
  icon: ReactNode;
  title: string;
  description: string;
}

export function ItemFeature({ icon, title, description }: ItemFeatureProps) {
  return (
    <div className="w-full max-w-96 text-center lg:text-start xl:text-start">
      <div className="w-12 h-12 mb-5 flex items-center justify-center mx-auto lg:mx-0 xl:mx-0">
        {icon}
      </div>
      <h3 className="text-gray-900 text-xl/6 font-medium mb-2">{title}</h3>
      <p className="text-gray-600 text-lg/relaxed leading-6">{description}</p>
    </div>
    
  );
}
