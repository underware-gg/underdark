
type ActionButtonProps = {
  label: string
  disabled?: boolean
  large?: boolean
  onClick: () => void
};

const ActionButton = ({
  label,
  disabled = false,
  large = false,
  onClick,
}: ActionButtonProps) => {
  const _className = disabled ? 'Locked' : 'Unlocked'
  const _button = <button className={_className} disabled={disabled} onClick={() => onClick()}>{label}</button>
  if (large) {
    return <h3>{_button}</h3>
  }
  return <h4>{_button}</h4>
}


// const PrevButton = (props) => (PrevNextButton({ ...props, direction: -1 }))
// const NextButton = (props) => (PrevNextButton({ ...props, direction: 1 }))

type PrevNextButtonProps = {
  direction: number
  disabled?: boolean
  onClick: () => void
};

const PrevNextButton = ({
  disabled = false,
  direction,
  onClick,
}: PrevNextButtonProps) => {
  const _label = direction < 0 ? '<' : '>'
  const _className = disabled ? 'Locked' : 'Unlocked'
  return <button className={`DirectionButton ${_className}`} disabled={disabled} onClick={() => onClick()}>{_label}</button>
}


export {
  ActionButton,
  // NextButton,
  // PrevButton,
  PrevNextButton,
}