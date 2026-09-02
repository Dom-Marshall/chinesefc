import { useState } from 'react'
import { STORAGE_KEY } from '../hooks/useStore'

function countProgress(raw) {
  try {
    const obj = JSON.parse(raw)
    return obj && obj.progressMap ? Object.keys(obj.progressMap).length : 0
  } catch {
    return 0
  }
}

export default function DataTransfer() {
  const [mode, setMode] = useState(null)        // null | 'export' | 'import'
  const [exportText, setExportText] = useState('')
  const [importText, setImportText] = useState('')
  const [pending, setPending] = useState(null)  // { data, n, existing }
  const [msg, setMsg] = useState(null)          // { type, text }
  const [copied, setCopied] = useState(false)

  const close = () => { setMode(null); setMsg(null); setPending(null) }

  const openExport = () => {
    setExportText(localStorage.getItem(STORAGE_KEY) || '')
    setMsg(null)
    setCopied(false)
    setMode('export')
  }

  const openImport = () => {
    setImportText('')
    setPending(null)
    setMsg(null)
    setMode('import')
  }

  const copyExport = async () => {
    try {
      await navigator.clipboard.writeText(exportText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setMsg({ type: 'err', text: 'Copy failed — long-press the text to select it, then copy manually.' })
    }
  }

  const onImportChange = (e) => {
    setImportText(e.target.value)
    if (pending) setPending(null)
    if (msg) setMsg(null)
  }

  const prepImport = () => {
    const text = importText.trim()
    if (!text) { setMsg({ type: 'err', text: 'Paste your backup text first.' }); return }
    let parsed
    try {
      parsed = JSON.parse(text)
    } catch {
      setMsg({ type: 'err', text: "That's not valid backup data — couldn't read it." })
      return
    }
    if (!parsed || typeof parsed !== 'object' || typeof parsed.progressMap !== 'object' || parsed.progressMap === null) {
      setMsg({ type: 'err', text: "That doesn't look like a Chinese SRS backup." })
      return
    }
    setMsg(null)
    setPending({
      data: JSON.stringify(parsed),
      n: Object.keys(parsed.progressMap).length,
      existing: countProgress(localStorage.getItem(STORAGE_KEY)),
    })
  }

  const confirmImport = () => {
    localStorage.setItem(STORAGE_KEY, pending.data)
    window.location.reload()
  }

  const exportCount = countProgress(exportText)

  return (
    <div className="control-group">
      <label className="control-label">Backup / transfer</label>
      <div className="pill-group">
        <button className="xfer-btn" onClick={mode === 'export' ? close : openExport}>
          Export progress
        </button>
        <button className="xfer-btn" onClick={mode === 'import' ? close : openImport}>
          Import progress
        </button>
      </div>

      {mode === 'export' && (
        <div className="xfer-panel">
          <p className="xfer-hint">
            {exportCount > 0
              ? `Backup of ${exportCount} card${exportCount === 1 ? '' : 's'}. Copy this text and send it to your new phone (message or email it to yourself), then open this menu there and tap Import.`
              : 'No saved progress found on this device yet.'}
          </p>
          {exportCount > 0 && (
            <>
              <textarea
                className="xfer-text"
                readOnly
                value={exportText}
                onFocus={(e) => e.target.select()}
              />
              <div className="pill-group">
                <button className="xfer-btn" onClick={copyExport}>
                  {copied ? 'Copied ✓' : 'Copy'}
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {mode === 'import' && (
        <div className="xfer-panel">
          <p className="xfer-hint">Paste the backup text from your old phone here, then tap Load.</p>
          <textarea
            className="xfer-text"
            value={importText}
            onChange={onImportChange}
            placeholder="Paste backup here…"
          />
          {pending ? (
            <>
              <p className="xfer-warn">
                Import progress for {pending.n} card{pending.n === 1 ? '' : 's'}?
                {pending.existing > 0
                  ? ` This will replace the ${pending.existing} card${pending.existing === 1 ? '' : 's'} of progress already on this device.`
                  : ''}
              </p>
              <div className="pill-group">
                <button className="xfer-btn xfer-btn-go" onClick={confirmImport}>Replace &amp; load</button>
                <button className="xfer-btn" onClick={() => setPending(null)}>Cancel</button>
              </div>
            </>
          ) : (
            <div className="pill-group">
              <button className="xfer-btn xfer-btn-go" onClick={prepImport}>Load progress</button>
            </div>
          )}
        </div>
      )}

      {msg && (
        <p className={`xfer-msg ${msg.type === 'err' ? 'xfer-err' : 'xfer-ok'}`}>{msg.text}</p>
      )}
    </div>
  )
}
