import {
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Loader,
  ThumbsUp
} from 'lucide-react'

const MAP = {

  APPROVED: {
    cls: 'badge-approved',
    Icon: ThumbsUp
  },

  REJECTED: {
    cls: 'badge-rejected',
    Icon: XCircle
  },

  ESCALATED: {
    cls: 'badge-escalated',
    Icon: AlertCircle
  },

  PROCESSING: {
    cls: 'badge-processing',
    Icon: Loader
  },

  PENDING: {
    cls: 'badge-pending',
    Icon: Clock
  },

  CREATED: {
    cls: 'badge-created',
    Icon: AlertCircle
  },

  VERIFIED: {
    cls: 'badge-verified',
    Icon: CheckCircle
  },

  FAILED: {
    cls: 'badge-failed',
    Icon: XCircle
  },

  PAN_VERIFIED: {
    cls: 'badge-pan-verified',
    Icon: CheckCircle
  },
}

export default function StatusBadge({ status }) {

  const {
    cls,
    Icon
  } = MAP[status] || MAP.PENDING

  return (
    <span className={`badge ${cls}`}>

      <Icon
        size={10}
        className={
          status === 'PROCESSING'
            ? 'animate-spin'
            : ''
        }
      />

      {status?.replace(/_/g, ' ')}
    </span>
  )
}