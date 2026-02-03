import { formatMoney } from "@/lib/money";
import { Card } from "@/components/ui/card";

export type SuggestionItem = {
  fromUserId: string;
  toUserId: string;
  amount: number;
  fromUser?: { id: string; name: string; email: string } | null;
  toUser?: { id: string; name: string; email: string } | null;
};

export function SuggestionsPanel({
  suggestions,
  currency,
}: {
  suggestions: SuggestionItem[];
  currency: string;
}) {
  if (suggestions.length === 0) {
    return (
      <Card className="p-4 text-sm text-muted-foreground">
        Everyone is settled up for now.
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {suggestions.map((suggestion, index) => (
        <Card key={`${suggestion.fromUserId}-${suggestion.toUserId}-${index}`} className="p-4">
          <div className="flex items-center justify-between text-sm">
            <div>
              <p className="font-medium">
                {suggestion.fromUser?.name || suggestion.fromUser?.email || "Member"} pays
              </p>
              <p className="text-muted-foreground">
                {suggestion.toUser?.name || suggestion.toUser?.email || "Member"}
              </p>
            </div>
            <p className="text-lg font-semibold">
              {formatMoney(suggestion.amount, currency)}
            </p>
          </div>
        </Card>
      ))}
    </div>
  );
}