import { IconBed, IconArea, IconCalendar } from '../icons';
import { formatCurrency } from '../../utils/dateHelpers';

const PropertyCard = ({ property, onSchedule, delay = 0 }) => (
  <article
    className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300 border border-gray-100 flex flex-col animate-fade-in"
    style={{ animationDelay: `${delay}ms` }}
  >
    <div className="relative h-64 overflow-hidden group">
      <img
        src={property.image}
        alt={property.title}
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        loading="lazy"
      />
      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-bold text-red-700">
        {property.type}
      </div>
    </div>
    <div className="p-6 flex-1 flex flex-col">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-bold text-gray-900 leading-tight">{property.title}</h3>
        <p className="text-lg font-extrabold text-red-600">
          {formatCurrency(property.price)}<span className="text-sm font-normal text-gray-500">/mês</span>
        </p>
      </div>
      <p className="text-gray-600 text-sm mb-6 flex-1">{property.description}</p>
      <div className="flex items-center gap-6 text-gray-500 text-sm border-t border-gray-100 pt-4">
        {property.bedrooms > 0 && <div className="flex items-center gap-1.5"><IconBed /> {property.bedrooms}</div>}
        <div className="flex items-center gap-1.5"><IconArea /> {property.area}m²</div>
      </div>
      <button
        onClick={() => onSchedule(property)}
        className="mt-6 w-full py-2.5 bg-red-50 hover:bg-red-600 text-red-700 hover:text-white font-medium rounded-xl flex items-center justify-center gap-2 transition-all duration-300"
      >
        <IconCalendar /> Agendar Visita
      </button>
    </div>
  </article>
);

export default PropertyCard;