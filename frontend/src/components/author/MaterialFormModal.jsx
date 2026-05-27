import { useRef } from 'react'
import {
  X, FileText, Video, ClipboardCheck, Upload, CloudUpload, Image,
  Shield, Layers, BarChart3, Globe, BookOpen,
} from 'lucide-react'
import MCQBuilder from './MCQBuilder'
import { MATERIAL_CATEGORIES } from '../../constants/categories'
import '../../styles/AuthorMaterialForm.css'

const DIFFICULTY_LEVELS = [
  { value: '', label: 'Select level' },
  { value: 'Beginner', label: 'Beginner' },
  { value: 'Intermediate', label: 'Intermediate' },
  { value: 'Advanced', label: 'Advanced' },
  { value: 'Beginner to Intermediate', label: 'Beginner to Intermediate' },
  { value: 'All Levels', label: 'All Levels' },
]

const LANGUAGES = ['English', 'Hindi', 'Marathi', 'Other']

const TITLE_MAX = 100
const SUMMARY_MAX = 200
const ABOUT_MAX = 1000

function TypeIcon({ type, size = 18 }) {
  if (type === 'VIDEO') return <Video size={size} />
  if (type === 'MCQ') return <ClipboardCheck size={size} />
  return <FileText size={size} />
}

function CharCount({ current, max }) {
  return <span className="material-form-field__count">{current}/{max}</span>
}

function FileDropzone({
  id,
  label,
  hint,
  accept,
  file,
  onChange,
  required,
  icon: Icon = CloudUpload,
}) {
  const inputRef = useRef(null)
  return (
    <div className="material-form-field">
      <label htmlFor={id}>
        {label}
        {required && <span className="required">*</span>}
      </label>
      <div
        className={`material-form-dropzone ${file ? 'material-form-dropzone--has-file' : ''}`}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
        role="button"
        tabIndex={0}
      >
        <input
          ref={inputRef}
          id={id}
          type="file"
          accept={accept}
          required={required && !file}
          onChange={(e) => onChange(e.target.files?.[0] || null)}
        />
        <div className="material-form-dropzone__icon">
          <Icon size={24} />
        </div>
        <strong>Click to upload or drag and drop</strong>
        <span>{hint}</span>
        {file && <div className="material-form-dropzone__filename">{file.name}</div>}
      </div>
    </div>
  )
}

export default function MaterialFormModal({
  open,
  editingMaterialId,
  formLoading,
  saving,
  form,
  setForm,
  materialFile,
  setMaterialFile,
  thumbnailFile,
  setThumbnailFile,
  mcqQuestions,
  setMcqQuestions,
  onClose,
  onSubmit,
}) {
  if (!open) return null

  const materialLabel =
    form.type === 'PDF'
      ? 'Upload PDF File'
      : form.type === 'VIDEO'
        ? 'Upload Video File'
        : null

  const materialHint =
    form.type === 'PDF'
      ? 'PDF files only. Max size: 50MB'
      : 'Video files (MP4, WebM). Max size: 500MB'

  const materialAccept =
    form.type === 'PDF' ? '.pdf,application/pdf' : 'video/*'

  return (
    <div className="material-form-overlay">
      <div className="material-form-layout">
        <aside className="material-form-sidebar">
          <div className="material-form-sidebar__illus">
            <div className="material-form-sidebar__illus-icon">
              <BookOpen size={48} />
            </div>
            <div>
              <h2>Share knowledge.<br />Make an impact.</h2>
              <p>Help students learn with quality notes, videos, and assessments.</p>
            </div>
          </div>
          <div className="material-form-sidebar__tip">
            <strong>Pro Tip</strong>
            <p>
              Materials with clear titles, detailed summaries, and eye-catching thumbnails
              get more purchases on the marketplace.
            </p>
          </div>
        </aside>

        <div className="material-form-main">
          <div className="material-form-main__close">
            <button type="button" onClick={onClose} aria-label="Close">
              <X size={20} />
            </button>
          </div>

          <div className="material-form-card">
            <div className="material-form-card__head">
              <div className="material-form-card__head-icon">
                <FileText size={24} />
              </div>
              <div>
                <h1>{editingMaterialId ? 'Edit Material' : 'New Material'}</h1>
                <p>Fill in the details below to upload your material.</p>
              </div>
            </div>

            {formLoading ? (
              <div className="material-form-loading">
                <div className="spinner" />
              </div>
            ) : (
              <form onSubmit={onSubmit}>
                <div className="material-form-field">
                  <label htmlFor="mat-title">
                    <span>Title<span className="required">*</span></span>
                    <CharCount current={form.title.length} max={TITLE_MAX} />
                  </label>
                  <input
                    id="mat-title"
                    className="material-form-input"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value.slice(0, TITLE_MAX) })}
                    maxLength={TITLE_MAX}
                    required
                  />
                </div>

                <div className="material-form-field">
                  <label htmlFor="mat-summary">
                    <span>Short Summary<span className="required">*</span></span>
                    <CharCount current={form.description.length} max={SUMMARY_MAX} />
                  </label>
                  <textarea
                    id="mat-summary"
                    className="material-form-textarea"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value.slice(0, SUMMARY_MAX) })}
                    maxLength={SUMMARY_MAX}
                    placeholder="Brief summary shown at the top of the material page"
                    rows={3}
                    required
                  />
                </div>

                <div className="material-form-field">
                  <label htmlFor="mat-about">
                    <span>About this Material (detailed context)<span className="required">*</span></span>
                    <CharCount current={form.about_material.length} max={ABOUT_MAX} />
                  </label>
                  <textarea
                    id="mat-about"
                    className="material-form-textarea material-form-textarea--lg"
                    value={form.about_material}
                    onChange={(e) => setForm({ ...form, about_material: e.target.value.slice(0, ABOUT_MAX) })}
                    maxLength={ABOUT_MAX}
                    placeholder="Full description, learning goals, and what students will gain"
                    rows={5}
                    required
                  />
                </div>

                <div className="material-form-field">
                  <label htmlFor="mat-tags">Tags (comma-separated)</label>
                  <input
                    id="mat-tags"
                    className="material-form-input"
                    value={form.tags}
                    onChange={(e) => setForm({ ...form, tags: e.target.value })}
                    placeholder="Data Visualization, Analytics, Tableau"
                  />
                  <p className="material-form-hint">Separate tags with commas to help students find your material.</p>
                </div>

                <div className="material-form-row material-form-row--2">
                  <div className="material-form-field">
                    <label htmlFor="mat-type">
                      Type<span className="required">*</span>
                    </label>
                    <div className="material-form-select-wrap">
                      <span className="material-form-select-wrap__icon">
                        <TypeIcon type={form.type} />
                      </span>
                      <select
                        id="mat-type"
                        className="material-form-select"
                        value={form.type}
                        onChange={(e) => setForm({ ...form, type: e.target.value })}
                        disabled={!!editingMaterialId}
                        required
                      >
                        <option value="PDF">PDF E-book</option>
                        <option value="VIDEO">Video Lesson</option>
                        <option value="MCQ">MCQ Test Set</option>
                      </select>
                    </div>
                  </div>
                  <div className="material-form-field">
                    <label htmlFor="mat-price">
                      Price (₹)<span className="required">*</span>
                    </label>
                    <input
                      id="mat-price"
                      type="number"
                      className="material-form-input"
                      value={form.price}
                      onChange={(e) => setForm({ ...form, price: e.target.value })}
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                </div>

                <div className="material-form-field">
                  <label htmlFor="mat-category">
                    Category<span className="required">*</span>
                  </label>
                  <div className="material-form-select-wrap">
                    <span className="material-form-select-wrap__icon">
                      <Layers size={18} />
                    </span>
                    <select
                      id="mat-category"
                      className="material-form-select"
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      required
                    >
                      <option value="">Select a category</option>
                      {MATERIAL_CATEGORIES.map((cat) => (
                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="material-form-row material-form-row--3">
                  <div className="material-form-field">
                    <label htmlFor="mat-university">University</label>
                    <input
                      id="mat-university"
                      className="material-form-input"
                      value={form.university}
                      onChange={(e) => setForm({ ...form, university: e.target.value })}
                      placeholder="e.g. SPPU"
                    />
                  </div>
                  <div className="material-form-field">
                    <label htmlFor="mat-course">Course</label>
                    <input
                      id="mat-course"
                      className="material-form-input"
                      value={form.course}
                      onChange={(e) => setForm({ ...form, course: e.target.value })}
                      placeholder="e.g. MCA"
                    />
                  </div>
                  <div className="material-form-field">
                    <label htmlFor="mat-semester">Semester</label>
                    <select
                      id="mat-semester"
                      className="material-form-select"
                      value={form.semester}
                      onChange={(e) => setForm({ ...form, semester: e.target.value })}
                    >
                      <option value="">Select</option>
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="material-form-row material-form-row--3">
                  <div className="material-form-field">
                    <label htmlFor="mat-topics">Topics Covered (count)</label>
                    <input
                      id="mat-topics"
                      type="number"
                      className="material-form-input"
                      min="1"
                      value={form.topics_covered}
                      onChange={(e) => setForm({ ...form, topics_covered: e.target.value })}
                      placeholder="e.g. 15"
                    />
                  </div>
                  <div className="material-form-field">
                    <label htmlFor="mat-level">Difficulty Level</label>
                    <div className="material-form-select-wrap">
                      <span className="material-form-select-wrap__icon">
                        <BarChart3 size={18} />
                      </span>
                      <select
                        id="mat-level"
                        className="material-form-select"
                        value={form.level}
                        onChange={(e) => setForm({ ...form, level: e.target.value })}
                      >
                        {DIFFICULTY_LEVELS.map((opt) => (
                          <option key={opt.value || 'empty'} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="material-form-field">
                    <label htmlFor="mat-language">Language</label>
                    <div className="material-form-select-wrap">
                      <span className="material-form-select-wrap__icon">
                        <Globe size={18} />
                      </span>
                      <select
                        id="mat-language"
                        className="material-form-select"
                        value={form.language}
                        onChange={(e) => setForm({ ...form, language: e.target.value })}
                      >
                        {LANGUAGES.map((lang) => (
                          <option key={lang} value={lang}>{lang}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {form.type !== 'PDF' && (
                  <div className="material-form-field">
                    <label htmlFor="mat-pages">Page Count (optional)</label>
                    <input
                      id="mat-pages"
                      type="number"
                      className="material-form-input"
                      min="1"
                      value={form.page_count}
                      onChange={(e) => setForm({ ...form, page_count: e.target.value })}
                      placeholder="For video/MCQ materials"
                    />
                  </div>
                )}

                {form.type === 'PDF' && !editingMaterialId && (
                  <p className="material-form-hint" style={{ marginTop: -8, marginBottom: 16 }}>
                    Page count and file size are detected automatically when you upload a PDF.
                  </p>
                )}
                {editingMaterialId && form.type === 'PDF' && (
                  <p className="material-form-hint" style={{ marginTop: -8, marginBottom: 16 }}>
                    Upload a new PDF only if you want to replace the existing file.
                  </p>
                )}

                {form.type !== 'MCQ' && materialLabel && (
                  <FileDropzone
                    id="mat-file"
                    label={editingMaterialId ? materialLabel.replace('Upload', 'Replace') + ' (optional)' : materialLabel}
                    hint={materialHint}
                    accept={materialAccept}
                    file={materialFile}
                    onChange={setMaterialFile}
                    required={!editingMaterialId}
                    icon={CloudUpload}
                  />
                )}

                <FileDropzone
                  id="mat-thumb"
                  label="Thumbnail Image (Optional)"
                  hint="Recommended size: 1200×800px, JPG or PNG up to 5MB"
                  accept="image/jpeg,image/png,image/webp"
                  file={thumbnailFile}
                  onChange={setThumbnailFile}
                  icon={Image}
                />

                {form.type === 'MCQ' && !editingMaterialId && (
                  <div style={{ marginBottom: 20 }}>
                    <MCQBuilder questions={mcqQuestions} onChange={setMcqQuestions} />
                  </div>
                )}
                {form.type === 'MCQ' && editingMaterialId && (
                  <p className="material-form-hint" style={{ marginBottom: 20 }}>
                    MCQ questions cannot be edited here. Update metadata or create a new test.
                  </p>
                )}

                <div className="material-form-footer">
                  <div className="material-form-policy">
                    <Shield size={18} />
                    <span>
                      By publishing, you confirm this content is original and complies with
                      EduMarket&apos;s author guidelines.
                    </span>
                  </div>
                  <div className="material-form-actions">
                    <button type="button" className="material-form-btn-cancel" onClick={onClose}>
                      Cancel
                    </button>
                    <button type="submit" className="material-form-btn-submit" disabled={saving}>
                      <Upload size={18} />
                      {saving ? 'Saving…' : editingMaterialId ? 'Save Changes' : 'Publish Material'}
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
