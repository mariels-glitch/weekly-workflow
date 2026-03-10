import ProgressBar from '../ProgressBar';

export default function ProgressBarExample() {
  return (
    <div className="p-4 space-y-4">
      <ProgressBar completed={3} total={8} />
      <ProgressBar completed={7} total={10} />
      <ProgressBar completed={0} total={5} />
    </div>
  );
}
