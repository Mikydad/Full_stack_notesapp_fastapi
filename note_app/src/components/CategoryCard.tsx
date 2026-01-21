import { Card, CardContent } from "./ui/card";

interface CategoryCardProps {
  name: string;
  id?: string;
  onClick?: () => void;  // Add onClick prop
}

const CategoryCard = ({ name, id, onClick }: CategoryCardProps) => {
  return (
    <Card 
      className="hover:shadow-md transition-shadow duration-200 cursor-pointer"
      onClick={onClick}  // Add onClick handler
    >
      <CardContent className="p-6">
        <h3 className="font-semibold text-gray-900 text-lg">{name}</h3>
      </CardContent>
    </Card>
  );
};

export default CategoryCard;