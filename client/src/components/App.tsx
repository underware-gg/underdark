import Burner from './Burner';
// import Example from './Example';
import TestMinter from '../underdark/components/TestMinter';
import { useSyncWorld } from '../underdark/hooks/useGraphQLQueries';

function App() {
  const { loading } = useSyncWorld();

  if (loading) {
    return <h1>loading...</h1>
  }

  return (
    <>
      <Burner />
      <hr />
      <TestMinter />
      <hr />
      {/* <Example /> */}
    </>
  );
}

export default App;
