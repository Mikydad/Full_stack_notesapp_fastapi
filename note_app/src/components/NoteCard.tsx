import { Card, CardContent } from "./ui/card";

interface NoteCardProps {
  title: string;
  description: string;
  id?: string;
  onClick?: () => void;
}

const NoteCard = ({ title, description, id, onClick }: NoteCardProps) => {
  // Truncate description to show preview (first 100 characters)
  const truncatedDesc = description.length > 100 
    ? description.substring(0, 100) + "..." 
    : description;

  return (
    <Card 
      className="hover:shadow-md transition-shadow duration-200 cursor-pointer h-full"
      onClick={onClick}
    >
      <CardContent className="p-6">
        <h3 className="font-semibold text-gray-900 text-lg mb-2">{title}</h3>
        <p className="text-gray-600 text-sm line-clamp-3">{truncatedDesc}</p>
      </CardContent>
    </Card>
  );
};

export default NoteCard;