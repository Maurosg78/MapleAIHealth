
export const AIMedicalWidget: React.FC = () => {
  const [query, setQuery] = useState('');
  const [currentEntry, setCurrentEntry] = useState<AIHistoryEntry | null>(null);
  const { query: aiQuery, loading, error, response } = useAIQuery();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    const result = await aiQuery({
      query,
      context: 'medical',
      priority: 'normal',
    });

    if (result) {
      setCurrentEntry(result);
    }
  };

  return (
    <Card className="p-4">
      <h3 className="text-lg font-semibold mb-4">Consulta IA Médica</h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="text"
          placeholder="Ingrese su consulta médica..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          disabled={loading}
        />

        <Button
          type="submit"
          disabled={loading || !query.trim()}
          className="w-full"
        >
          {loading ? <Spinner size="sm" /> : 'Consultar'}
        </Button>
      </form>

      {error && <div className="mt-4 text-red-500 text-sm">{error}</div>}

      {response && (
        <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h4 className="font-medium mb-2">Respuesta:</h4>
          <p className="text-sm">{response.response}</p>
          <div className="mt-2 text-xs text-gray-500">
            Fuente: {response.provider}
          </div>
        </div>
      )}

      {currentEntry && (
        <ResponseFeedback
          entryId={currentEntry.id}
          onFeedbackSubmitted={() => setCurrentEntry(null)}
        />
      )}
    </Card>
  );
};
