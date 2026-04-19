package com.ovula.app.ui.adapter

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.RecyclerView
import com.ovula.app.databinding.ItemRecipeBinding
import com.ovula.app.ui.main.DietTabFragment

class RecipesAdapter(
    private val recipes: List<DietTabFragment.Recipe>
) : RecyclerView.Adapter<RecipesAdapter.RecipeViewHolder>() {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): RecipeViewHolder {
        val binding = ItemRecipeBinding.inflate(
            LayoutInflater.from(parent.context),
            parent,
            false
        )
        return RecipeViewHolder(binding)
    }

    override fun onBindViewHolder(holder: RecipeViewHolder, position: Int) {
        holder.bind(recipes[position])
    }

    override fun getItemCount(): Int = recipes.size

    class RecipeViewHolder(private val binding: ItemRecipeBinding) :
        RecyclerView.ViewHolder(binding.root) {

        fun bind(recipe: DietTabFragment.Recipe) {
            binding.tvRecipeName.text = recipe.name
            binding.tvBenefits.text = recipe.benefits
            binding.tvTime.text = recipe.time
            binding.tvCalories.text = recipe.calories
        }
    }
}
