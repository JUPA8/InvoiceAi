import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

interface SidebarItemProps {
  icon: React.ElementType;
  label: string;
  hasChevron?: boolean;
  isActive?: boolean;
  href?: string;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ 
  icon: Icon, 
  label, 
  hasChevron = false, 
  isActive = false,
  href
}) => {
  const content = (
    <div className={`flex items-center justify-between px-2 py-2 rounded-md cursor-pointer hover:bg-gray-100 ${isActive ? 'bg-gray-100' : ''}`}>
      <div className="flex items-center gap-2">
        <Icon size={16} className="text-gray-700" />
        <span className="text-sm text-gray-900">{label}</span>
      </div>
      {hasChevron && <ChevronRight size={16} className="text-gray-400" />}
    </div>
  );

  if (href) {
    return (
      <Link href={href}>
        {content}
      </Link>
    );
  }

  return content;
};

export default SidebarItem;