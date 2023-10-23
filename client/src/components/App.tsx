import Burner from './Burner';
import { useSyncWorld } from '../underdark/hooks/useGraphQLQueries';

function App() {
  const { loading } = useSyncWorld();

  if (loading) {
    return <h1>loading...</h1>
  }

  return (
    <>
      <Burner />
    </>
  );
}

export default App;
