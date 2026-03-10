import Panel from '../Panel';

export default function PanelExample() {
  return (
    <Panel 
      title="Demo Panel" 
      subtitle="This is a demo subtitle"
      headerActions={<span className="text-muted-foreground">Action</span>}
    >
      <p className="text-foreground">Panel content goes here</p>
    </Panel>
  );
}
