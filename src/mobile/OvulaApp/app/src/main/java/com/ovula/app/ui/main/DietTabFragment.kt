package com.ovula.app.ui.main

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import androidx.recyclerview.widget.LinearLayoutManager
import com.ovula.app.databinding.FragmentDietTabBinding
import com.ovula.app.ui.adapter.RecipesAdapter

class DietTabFragment : Fragment() {

    private var _binding: FragmentDietTabBinding? = null
    private val binding get() = _binding!!
    private lateinit var cuisineType: String

    companion object {
        private const val ARG_CUISINE = "cuisine"

        fun newInstance(cuisine: String): DietTabFragment {
            return DietTabFragment().apply {
                arguments = Bundle().apply {
                    putString(ARG_CUISINE, cuisine)
                }
            }
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        cuisineType = arguments?.getString(ARG_CUISINE) ?: "western"
    }

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentDietTabBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        
        setupRecyclerView()
    }

    private fun setupRecyclerView() {
        val recipes = if (cuisineType == "western") getWesternRecipes() else getDesiRecipes()
        
        val adapter = RecipesAdapter(recipes)
        binding.recyclerRecipes.apply {
            layoutManager = LinearLayoutManager(requireContext())
            this.adapter = adapter
        }
    }

    private fun getWesternRecipes(): List<Recipe> {
        return listOf(
            Recipe("Quinoa Buddha Bowl", "High Protein, Low GI", "25 min", "420 cal"),
            Recipe("Salmon with Vegetables", "Omega-3, High Protein", "30 min", "480 cal"),
            Recipe("Greek Yogurt Parfait", "Probiotic, High Protein", "10 min", "280 cal"),
            Recipe("Zucchini Noodles with Pesto", "Low Carb, Nutrient Dense", "20 min", "320 cal")
        )
    }

    private fun getDesiRecipes(): List<Recipe> {
        return listOf(
            Recipe("Moong Dal Khichdi", "Easy Digestion, High Protein", "30 min", "350 cal"),
            Recipe("Palak Paneer (Low Fat)", "Iron Rich, High Protein", "35 min", "380 cal"),
            Recipe("Methi Paratha with Dahi", "Blood Sugar Control, Fiber Rich", "25 min", "320 cal"),
            Recipe("Chana Chaat", "High Protein, Low GI", "15 min", "250 cal")
        )
    }

    data class Recipe(
        val name: String,
        val benefits: String,
        val time: String,
        val calories: String
    )

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
