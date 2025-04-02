

interface ResponseFeedbackProps {
  entryId: string;
  onFeedbackSubmitted?: () => void;
}

export const ResponseFeedback: React.FC<ResponseFeedbackProps> = ({
  entryId,
  onFeedbackSubmitted,
}) => {
  const [helpful, setHelpful] = useState<boolean | null>(null);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (helpful === null) return;

    try {
      setSubmitting(true);
      await aiHistoryService.addFeedback(entryId, {
        helpful,
        comment: comment.trim() || undefined,
      });
      onFeedbackSubmitted?.();
    } catch (error) {
      console.error('Error submitting feedback:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-4 space-y-4">
      <div className="flex items-center space-x-4">
        <Button
          variant={helpful === true ? 'primary' : 'secondary'}
          onClick={() => setHelpful(true)}
          disabled={submitting}
        >
          👍 Útil
        </Button>
        <Button
          variant={helpful === false ? 'primary' : 'secondary'}
          onClick={() => setHelpful(false)}
          disabled={submitting}
        >
          👎 No útil
        </Button>
      </div>

      {helpful !== null && (
        <div className="space-y-2">
          <Input
            type="text"
            placeholder="Comentario (opcional)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            disabled={submitting}
          />
          <Button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full"
          >
            {submitting ? 'Enviando...' : 'Enviar Feedback'}
          </Button>
        </div>
      )}
    </div>
  );
};
