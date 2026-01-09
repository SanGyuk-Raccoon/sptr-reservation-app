import { useState } from 'react'
import type { AppointmentFormData } from '../types/calendar'

interface AppointmentFormProps {
  onSubmit: (data: AppointmentFormData) => void
  onCancel: () => void
}

export function AppointmentForm({ onSubmit, onCancel }: AppointmentFormProps) {
  const [formData, setFormData] = useState<AppointmentFormData>({
    title: '',
    time: '',
    description: ''
  })

  const handleSubmit = () => {
    if (!formData.title || !formData.time) {
      alert('제목과 시간을 입력해주세요.')
      return
    }
    onSubmit(formData)
  }

  return (
    <div className="appointment-form">
      <input
        type="text"
        placeholder="일정 제목"
        value={formData.title}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        className="form-input"
      />
      <input
        type="time"
        value={formData.time}
        onChange={(e) => setFormData({ ...formData, time: e.target.value })}
        className="form-input"
      />
      <textarea
        placeholder="설명 (선택사항)"
        value={formData.description}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        className="form-textarea"
        rows={3}
      />
      <div className="form-buttons">
        <button onClick={handleSubmit} className="save-button">
          저장
        </button>
        <button onClick={onCancel} className="cancel-button">
          취소
        </button>
      </div>
    </div>
  )
}
