package com.ovula.app.ui.adapter

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.ovula.app.data.model.LogResponse
import com.ovula.app.databinding.ItemLogBinding

class LogsAdapter(
    private val onDeleteClick: (Int) -> Unit
) : ListAdapter<LogResponse, LogsAdapter.LogViewHolder>(LogDiffCallback()) {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): LogViewHolder {
        val binding = ItemLogBinding.inflate(
            LayoutInflater.from(parent.context),
            parent,
            false
        )
        return LogViewHolder(binding, onDeleteClick)
    }

    override fun onBindViewHolder(holder: LogViewHolder, position: Int) {
        holder.bind(getItem(position))
    }

    class LogViewHolder(
        private val binding: ItemLogBinding,
        private val onDeleteClick: (Int) -> Unit
    ) : RecyclerView.ViewHolder(binding.root) {

        fun bind(log: LogResponse) {
            binding.tvDate.text = log.date
            binding.tvPeriodStatus.text = log.periodStatus.replaceFirstChar { it.uppercase() }
            binding.tvMood.text = "Mood: ${log.mood}/5"
            binding.tvSleep.text = log.sleepHours?.let { "Sleep: ${it}h" } ?: "Sleep: N/A"
            binding.tvNotes.text = log.notes ?: "No notes"
            
            binding.btnDelete.setOnClickListener {
                onDeleteClick(log.id)
            }
        }
    }

    class LogDiffCallback : DiffUtil.ItemCallback<LogResponse>() {
        override fun areItemsTheSame(oldItem: LogResponse, newItem: LogResponse): Boolean {
            return oldItem.id == newItem.id
        }

        override fun areContentsTheSame(oldItem: LogResponse, newItem: LogResponse): Boolean {
            return oldItem == newItem
        }
    }
}
