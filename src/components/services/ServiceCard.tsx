import React from 'react';
import { Service } from '@/types/api';

interface ServiceCardProps {
  service: Service;
  onClick?: (id: string) => void;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ service, onClick }) => {
  const cover = service.gallery && service.gallery.length > 0 ? service.gallery[0].url : '/placeholder.svg';

  return (
    <div className="group rounded-lg border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => onClick?.(service._id)}>
      <div className="aspect-video w-full overflow-hidden rounded-t-lg bg-gray-100">
        <img src={cover} alt={service.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform" />
      </div>
      <div className="p-4 space-y-2">
        <h3 className="line-clamp-2 font-semibold text-gray-900">{service.title}</h3>
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <span className="inline-flex items-center gap-1">
              <span>⭐</span>
              <span>{service.rating?.average?.toFixed?.(1) || '0.0'}</span>
              <span className="text-gray-400">({service.rating?.count || 0})</span>
            </span>
          </div>
          <div className="font-semibold text-gray-900">From ${service.startingPrice}</div>
        </div>
      </div>
    </div>
  );
};

export default ServiceCard;


